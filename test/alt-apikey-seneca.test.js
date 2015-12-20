"use strict";
var proxyquire      = require('proxyquire'),
    Promise         = require('bluebird'),
    chai            = require('chai'),
    sinon           = require('sinon'),
    expect          = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require("chai-as-promised"));

var senecaAuth = require('../alt-apikey-seneca');

describe('alt-apiKey-seneca', function() {

	var senecaCreateMockResponse = {
	};

    var config = {};

	var senecaMock = {
		addAsync: sinon.stub(),
		actAsync: sinon.stub().returns(Promise.resolve(senecaCreateMockResponse)),
        reset: function() {
            senecaMock.addAsync.reset();
            senecaMock.actAsync.reset();
        }
	};

	var UserMockConstructorStub = sinon.stub();
	var UserMock = function() { return UserMockConstructorStub.apply(this, arguments); };
	UserMockConstructorStub.returns(UserMock);
	UserMock.hasMany = sinon.stub();

	var ApiKeyMockConstructorStub = sinon.stub();
	var ApiKeyMock = function() { return ApiKeyMockConstructorStub.apply(this, arguments); };
	ApiKeyMockConstructorStub.returns(ApiKeyMock);
	ApiKeyMock.belongsTo = sinon.stub();
	ApiKeyMock.saveAll = sinon.stub().returns(Promise.resolve('APIKEY1'));
	ApiKeyMock.get = sinon.stub().returns(Promise.resolve('APIKEY2'));

	var thinkyMock = function() { return {
		createModel: function(m) {
			switch (m) {
				case 'User': return UserMock;
				case 'ApiKey': return ApiKeyMock;
			}
		},
		type: { string: function() {}  }
	}};

proxyquire('../alt-apikey-seneca', { thinky: thinkyMock })(config, senecaMock);

    var actionCreate = senecaMock.addAsync.args[0][1];
    var actionGet = senecaMock.addAsync.args[1][1];
    var actionEnable = senecaMock.addAsync.args[2][1];
    var actionDisable = senecaMock.addAsync.args[3][1];
    var actionValidate = senecaMock.addAsync.args[4][1];

    describe('seneca message handler', function () {

        proxyquire('../alt-apikey-seneca', {})(config, senecaMock);

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[0][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[0][0].action).to.equal('create');
        });

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[1][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[1][0].action).to.equal('get');
        });

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[2][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[2][0].action).to.equal('enable');
        });

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[3][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[3][0].action).to.equal('disable');
        });

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[4][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[4][0].action).to.equal('validate');
        });
    });

	describe('create', function() {

		it('should create an ApiKey in the DB', function(done) {

			actionCreate({ userId: 'USERID1', name: 'NAME1' });

			expect(ApiKeyMockConstructorStub).to.have.been.calledWith({
				userId  : 'USERID1',
				name    : 'NAME1',
				disabled: false
			});

			done();
		});

		it('should reply with success and the apiKey from the DB', function(done) {

			var response = actionCreate({ userId: 'USERID1', name: 'NAME1' });

			response.then(function(result) {
				expect(result.success).to.equal(true);
				expect(result.apiKey).to.equal('APIKEY1');
				done();
			}).catch(function(err) {
				expect(err).to.equal(false);
				done(err);
			});
		});
	});

	describe('get', function() {

		it('should reply with success and the apiKey from the DB', function(done) {

			ApiKeyMock.get.reset();

			var response = actionGet({ id: 'ID1' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID1');

			response.then(function(result) {
				expect(result.success).to.equal(true);
				expect(result.apiKey).to.equal('APIKEY2');
				done();
			})
			.catch(function(err) {
				expect(err).to.equal(false);
				done(err);
			});
		});
	});

	describe('enable', function() {

		it('should reply with success and the apiKey from the DB', function(done) {

			ApiKeyMock.get.reset().returns(Promise.resolve(ApiKeyMock));
			ApiKeyMock.saveAll.returns(Promise.resolve('APIKEY2'));
			ApiKeyMock.disabled = true;

			var response = actionEnable({ id: 'ID2' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID2');

			response.then(function(result) {
				expect(ApiKeyMock.disabled).to.equal(false);
				expect(result.success).to.equal(true);
				expect(result.apiKey).to.equal('APIKEY2');
				done();
			})
			.catch(function(err) {
				expect(err).to.equal(false);
				done(err);
			});
		});

		it('should reply with fail if no apiKey found in the DB', function(done) {

			ApiKeyMock.get.reset().returns(Promise.reject());
			ApiKeyMock.saveAll.returns(Promise.resolve('OK'));
			ApiKeyMock.disabled = false;

			var response = actionEnable({ id: 'ID3' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID3');

			response.then(function(result) {
				expect(result.success).to.equal(false);
				expect(result.apiKey).to.equal(undefined);
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});

	describe('disable', function() {

		it('should reply with success and the apiKey from the DB', function(done) {

			ApiKeyMock.get.reset().returns(Promise.resolve(ApiKeyMock));
			ApiKeyMock.saveAll.returns(Promise.resolve('APIKEY2'));

			var response = actionDisable({ id: 'ID2' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID2');

			response.then(function(result) {

				expect(ApiKeyMock.disabled).to.equal(true);
				expect(result.success).to.equal(true);
				expect(result.apiKey).to.equal('APIKEY2');
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});

		it('should reply with fail if no apiKey found in the DB', function(done) {

			ApiKeyMock.get.reset().returns(Promise.reject());
			ApiKeyMock.saveAll.returns(Promise.resolve('OK'));

			var response = actionEnable({ id: 'ID3' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID3');

			response.then(function(result) {
				expect(result.success).to.equal(false);
				expect(result.apiKey).to.equal(undefined);
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});

	describe('validate', function() {

		it('should reply with success and true if valid', function(done) {

			ApiKeyMock.get.reset().returns(Promise.resolve({ enabled: true }));

			var response = actionValidate({ id: 'ID1' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID1');

			response.then(function(result) {
				expect(result.success).to.equal(true);
				expect(result.valid).to.equal(true);
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});

		it('should reply with success and false if not valid', function(done) {

			ApiKeyMock.get.reset().returns(Promise.resolve({ enabled: false }));

			var response = actionValidate({ id: 'ID1' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID1');

			response.then(function(result) {
				expect(result.success).to.equal(true);
				expect(result.valid).to.equal(false);
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});

		it('should reply with success and false if not found', function(done) {

			ApiKeyMock.get.reset().returns(Promise.reject());

			var response = actionValidate({ id: 'ID1' });

			expect(ApiKeyMock.get).to.have.been.calledWith('ID1');

			response.then(function(result) {
				expect(result.success).to.equal(true);
				expect(result.valid).to.equal(false);
				done();
			})
				.catch(function(err) {
					expect(err).to.equal(false);
					done(err);
				});
		});
	});

});
