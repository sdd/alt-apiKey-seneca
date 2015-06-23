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

	var senecaMock = {
		addAsync: sinon.stub(),
		actAsync: sinon.stub().returns(Promise.resolve(senecaCreateMockResponse))
	};

    describe('seneca message handler: create', function () {

        proxyquire('../apiKey', {})(config, senecaMock);

        var action = senecaMock.addAsync.args[0][1];

        it('should register with seneca using the correct matcher', function () {
            expect(senecaMock.addAsync.args[0][0].system).to.equal('apiKey');
            expect(senecaMock.addAsync.args[0][0].action).to.equal('create');
        });
    });
});
