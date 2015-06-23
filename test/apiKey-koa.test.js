"use strict";
var request         = require('supertest'),
    koa             = require('koa'),
    mount           = require('koa-mount'),
    router          = require('koa-router'),
    Promise         = require('bluebird'),
    chai            = require("chai"),
    sinon           = require("sinon"),
    expect          = chai.expect;

chai.use(require("sinon-chai"));

var senecaAuthKoa = require('../apiKey-koa');

describe('seneca-auth-koa', function() {

    var senecaActStub = sinon.stub();
    var senecaMock = { actAsync: senecaActStub };
    var app = koa().use(senecaAuthKoa(senecaMock));
    senecaActStub.returns(Promise.resolve({}));

    var testRouter = router()
        .get('/apiKey', function * (next) {
            this.session = session;
            yield next;
        });

    var superApp = koa()
        .use(testRouter.routes())
        .use(mount('/', app));
    superApp.keys = ['test'];

    describe('POST /apiKey', function() {

        it('should pass the correct system and action to seneca', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .post('/apiKey')
	            .send({ name: 'APIKEYNAME1' })
                .end(function() {

                    expect(senecaActStub.args[0][0].system).to.equal('apiKey');
                    expect(senecaActStub.args[0][0].action).to.equal('create');

                    done();
                });
        });

        it('should pass the correct userid and name', function(done) {

	        senecaActStub.reset();
	        request(superApp.listen())
		        .post('/apiKey')
		        //TODO: pass userid as sub from jwt in state
		        .send({ name: 'APIKEYNAME1' })
		        .end(function() {

			        expect(senecaActStub.args[0][0].userId).to.equal('USERID1');
			        expect(senecaActStub.args[0][0].name).to.equal('APIKEYNAME1');

			        done();
		        });
        });

    });
});
