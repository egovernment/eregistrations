'use strict';

var emptyPromise = require('deferred')(null)
  , genId        = require('time-uuid')
  , login        = require('mano-auth/server/authentication').login
  , mano         = require('mano')

  , dbDriver = mano.dbDriver
  , maxage = 1000 * 60 * 60 * 24 * 7;

exports.login = require('mano-auth/controller/server-master/login');
exports.register = require('mano-auth/controller/server-master/register-and-login');
exports['reset-password'] = require('mano-auth/controller/server-master/reset-password');
exports['request-reset-password'] =
	require('mano-auth/controller/server-master/request-reset-password');

exports['init-demo'] = {
	validate: Function.prototype,
	submit: function () {
		var cookieName = 'demoUser'
		  , userId     = this.res.cookies.get(cookieName)
		  , promise, storage;

		storage = dbDriver.getStorage('user');
		if (userId) promise = storage.get(userId + '/isDemo');
		else promise = emptyPromise;
		return promise(function (data) {
			var records, promise;
			if (!data || (data.value !== '11')) {
				userId = genId();
				records = [
					{ id: userId, data: { value: '7User#' } },
					{ id: userId + '/isDemo', data: { value: '11' } },
					{ id: userId + '/roles*user', data: { value: '11' } }
				];
				storage.storeMany(records).done();
				promise = mano.registerUserAccess(userId);
			} else {
				promise = emptyPromise;
			}
			return promise(function () {
				this.res.cookies.set(cookieName, userId, { maxage: maxage });
				login(userId, this.req, this.res);
			}.bind(this));
		}.bind(this));
	},
	redirectUrl: '/'
};
