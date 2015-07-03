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

describe('apiKey-koa', function() {

    var ctx = {
        state: {
            jwt: { sub: 'USERID1' }
        },
        session: {}
    };

    var senecaActStub = sinon.stub();
    var senecaMock = { actAsync: senecaActStub };

    var app = koa()
        .use(require('koa-bodyparser')())
        .use(senecaAuthKoa(senecaMock));

    senecaActStub.returns(Promise.resolve({ apiKey: 'RESULT1' }));

    var testRouter = router()
        .all('*', function * (next) {
            this.session = ctx.session;
            this.state = ctx.state;
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
		        // userid passed in as sub from jwt in state
		        .send({ name: 'APIKEYNAME1' })
		        .end(function() {

			        expect(senecaActStub.args[0][0].userId).to.equal('USERID1');
			        expect(senecaActStub.args[0][0].name).to.equal('APIKEYNAME1');

			        done();
		        });
        });

        it('should return the response from seneca as the body', function(done) {
            senecaActStub.reset();
            request(superApp.listen())
                .post('/apiKey')
                .send({ name: 'APIKEYNAME1' })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.apiKey).to.equal('RESULT1');
                })
                .end(done);
        })
    });

    describe('GET /apiKey', function() {

        it('should pass the correct system and action to seneca', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .get('/apiKey')
                .send({ name: 'APIKEYNAME1' })
                .expect(function() {
                    expect(senecaActStub.args[0][0].system).to.equal('apiKey');
                    expect(senecaActStub.args[0][0].action).to.equal('get');
                })
                .end(done);
        });

        it('should pass the correct userid', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .get('/apiKey')
                .expect(function() {
                    expect(senecaActStub.args[0][0].userId).to.equal('USERID1');
                })
                .end(done);
        });

        it('should return the response from seneca as the body', function(done) {
            senecaActStub.reset();
            request(superApp.listen())
                .get('/apiKey')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.apiKey).to.equal('RESULT1');
                })
                .end(done);
        })
    });

    describe('PUT /apiKey/:apiKeyId/enable', function() {

        it('should pass the correct system and action to seneca for enable', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .put('/apiKey/APIKEY1/enable')
                .expect(function() {
                    expect(senecaActStub.args[0][0].system).to.equal('apiKey');
                    expect(senecaActStub.args[0][0].action).to.equal('enable');
                })
                .end(done);
        });

        it('should pass the correct system and action to seneca for disable', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .put('/apiKey/APIKEY1/disable')
                .expect(function() {
                    expect(senecaActStub.args[0][0].system).to.equal('apiKey');
                    expect(senecaActStub.args[0][0].action).to.equal('disable');
                })
                .end(done);
        });

        it('should pass the correct apikeyid', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .put('/apiKey/APIKEY1/enable')
                .expect(function() {
                    expect(senecaActStub.args[0][0].apiKeyId).to.equal('APIKEY1');
                })
                .end(done);
        });

        it('should return the response from seneca as the body', function(done) {
            senecaActStub.reset();
            request(superApp.listen())
                .put('/apiKey/APIKEY1/enable')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.apiKey).to.equal('RESULT1');
                })
                .end(done);
        })
    });

    describe('DEL /apiKey/:apiKeyId', function() {

        it('should pass the correct system and action to seneca for delete', function(done) {

            senecaActStub.returns(Promise.resolve({ success: true }));

            senecaActStub.reset();
            request(superApp.listen())
                .delete('/apiKey/APIKEY1')
                .expect(function() {
                    expect(senecaActStub.args[0][0].system).to.equal('apiKey');
                    expect(senecaActStub.args[0][0].action).to.equal('delete');
                })
                .end(done);
        });

        it('should pass the correct apikeyid', function(done) {

            senecaActStub.returns(Promise.resolve({ success: true }));

            senecaActStub.reset();
            request(superApp.listen())
                .delete('/apiKey/APIKEY1')
                .expect(function() {
                    expect(senecaActStub.args[0][0].apiKeyId).to.equal('APIKEY1');
                })
                .end(done);
        });

        it('should return a 204 response if the item is found', function(done) {

            senecaActStub.returns(Promise.resolve({ success: true }));

            senecaActStub.reset();
            request(superApp.listen())
                .delete('/apiKey/APIKEY1')
                .expect(204)
                .end(done);
        });

        it('should return a 404 response if the item is found', function(done) {

            senecaActStub.returns(Promise.resolve({ success: false, result: 'NOT FOUND' }));

            senecaActStub.reset();
            request(superApp.listen())
                .delete('/apiKey/APIKEY1')
                .expect(404)
                .end(done);
        })
    });
});
