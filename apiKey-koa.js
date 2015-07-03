'use strict';
const _      = require('lodash'),
      router = require('koa-router')();

const defaults = {
    url: {
        create: '/apiKey',
        retrieve: '/apiKey',
        enable: '/apiKey/:apiKeyId/enable',
        disable: '/apiKey/:apiKeyId/disable',
        del: '/apiKey/:apiKeyId'
    }
};

module.exports = function(seneca_instance, options) {
	const seneca = seneca_instance || require('seneca')();

	options = _.extend(defaults, options);

	router.param('apiKeyId', function * param_strategy(apiKeyId, next) {
		this.apiKeyId = apiKeyId;
		if (!this.apiKeyId) { return this.status = 404; }
		yield next;
	});

	router.post(options.url.create, function* post_apiKey_create() {
		let args   = {
			system  : 'apiKey',
			action  : 'create',
			userId  : _.get(this, 'state.jwt.sub'),
			name    : _.get(this, 'request.body.name', '').toString()
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	router.get(options.url.retrieve, function* get_apiKey_retrieve() {
		let args = {
			system  : 'apiKey',
			action  : 'get',
            userId  : _.get(this, 'state.jwt.sub')
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	router.put(options.url.enable, function* put_apiKey_enable() {
		//TODO: authz
		let args = {
			system  : 'apiKey',
			action  : 'enable',
            apiKeyId: this.apiKeyId
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

    router.put(options.url.disable, function* put_apiKey_disable() {
        //TODO: authz
        let args = {
            system  : 'apiKey',
            action  : 'disable',
            apiKeyId: this.apiKeyId
        };
        let result = yield seneca.actAsync(args);
        this.body  = result;
    });

    router.delete(options.url.del, function* put_apiKey_delete() {
        //TODO: authz
        let args = {
            system  : 'apiKey',
            action  : 'delete',
            apiKeyId: this.apiKeyId
        };
        let result = yield seneca.actAsync(args);

        this.status = result.success ? 204 : 404;
    });

	return router.middleware();
};
