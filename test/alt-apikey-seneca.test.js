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

    proxyquire('../alt-apikey-seneca', {})(config, senecaMock);

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
});
