'use strict';
const _      = require('lodash'),
      router = require('koa-router')();

const defaults = {
	auth_url    : '/auth/:strategy',
	callback_url: '/auth/:strategy/callback'
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
			userId  : this.state.jwt.sub,
			name    : this.query.name.toString()
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	router.get(options.url.retrieve, function* get_apiKey_retrieve() {
		//TODO: change get to retrieve all the keys for the current user
		let args = {
			system  : 'apiKey',
			action  : 'get',
			id      : this.apiKeyId
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	router.put(options.url.enable, function* put_apiKey_enable() {
		//TODO: authz
		let args = {
			system  : 'apiKey',
			action  : this.body.enabled ? 'enable' : 'disable',
			id      : this.apiKeyId
		};
		let result = yield seneca.actAsync(args);
		this.body  = result;
	});

	return router.middleware();
};
