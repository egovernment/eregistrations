'use strict';

var emptyPromise   = require('deferred')(undefined)
  , genId          = require('time-uuid')
  , login          = require('mano-auth/server/authentication').login
  , mano           = require('mano')

  , db = mano.db, dbDriver = mano.dbDriver
  , maxage = 1000 * 60 * 60 * 24 * 7;

exports.login = require('mano-auth/controller/server/login');
exports.register = require('mano-auth/controller/server/register-and-login');
exports['add-user'] = require('mano-auth/controller/server/register');
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');

exports['init-demo'] = {
	validate: Function.prototype,
	submit: function () {
		var cookieName = 'demoUser'
		  , userId     = this.res.cookies.get(cookieName)
		  , demoUser, promise;

		if (dbDriver) {
			if (userId) promise = dbDriver.get(userId + '/isDemo');
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
					dbDriver.storeMany(records).done();
					promise = mano.registerUserAccess(userId);
				} else {
					promise = emptyPromise;
				}
				return promise(function () {
					this.res.cookies.set(cookieName, userId, { maxage: maxage });
					login(userId, this.req, this.res);
				}.bind(this));
			}.bind(this));
		}

		// TODO: Legacy logic to be removed, when all systems stand on persistent driver
		if (userId) {
			demoUser = db.User.getById(userId);
		}

		if (!demoUser || !demoUser.isDemo) {
			demoUser = new db.User();
			demoUser.roles.add('user');
			demoUser.isDemo = true;
		}

		this.res.cookies.set(cookieName, demoUser.__id__, { maxage: maxage });
		login(demoUser.__id__, this.req, this.res);
	},
	redirectUrl: '/'
};
