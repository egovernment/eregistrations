'use strict';

var emptyPromise     = require('deferred')(null)
  , genId            = require('time-uuid')
  , login            = require('mano-auth/server/authentication').login
  , registerSubmit   = require('mano-auth/controller/server-master/register-and-login').submit
  , mano             = require('mano')
  , sendNotification = require('../../server/email-notifications/create-account')

  , dbDriver = mano.dbDriver
  , maxage = 1000 * 60 * 60 * 24 * 7
  , customError      = require('es5-ext/error/custom')
  , promisify        = require('deferred').promisify
  , bcrypt           = require('bcrypt')
  , serializeValue   = require('dbjs/_setup/serialize/value')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash)
  , userStorage = mano.dbDriver.getStorage('user');

exports.login = require('mano-auth/controller/server-master/login');
exports.register = {
	submit: function (data) {
		if (data.isManager) {
			data['User#/roles'] = ['manager'];
			delete data.isManager;
		}

		return registerSubmit.apply(this, arguments)(function (result) {
			dbDriver.onDrain(function () { sendNotification(data).done(null, function (err) {
				console.log("Cannot send email", err.stack);
			}); });
		});
	}
};
exports['reset-password'] = require('mano-auth/controller/server-master/reset-password');
exports['request-reset-password'] =
	require('mano-auth/controller/server-master/request-reset-password');

exports['create-managed-account'] = {
	submit: function (data) {
		var that = this;
		userStorage.searchOne({ keyPath: 'createManagedAccountToken',
			value: serializeValue(data['create-managed-account-token']) }, function (id) {
			return id.split('/')[0];
		})(function (userId) {
			if (!userId) {
				throw customError("Cannot process request", "MALFORMED_EMAIL", { statusCode: 400 });
			}
			return hash(data.password, genSalt())(function (password) {
				return userStorage.storeMany([
					{ id: userId + '/createManagedAccountToken', data: { value: '' } },
					{ id: userId + '/roles*user', data: { value: serializeValue(true) } },
					{ id: userId + '/password', data: { value: serializeValue(password) } }
				]).then(function () {
					login(userId, that.req, that.res);
				});
			});
		});
	}
};

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
				promise = storage.storeMany(records);
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
