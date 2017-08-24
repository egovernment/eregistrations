'use strict';

var emptyPromise     = require('deferred')(null)
  , genId            = require('time-uuid')
  , login            = require('mano-auth/server/authentication').login
  , serverLogin      = require('mano-auth/controller/server-master/login')
  , registerSubmit   = require('mano-auth/controller/server-master/register').submit
  , mano             = require('mano')
  , hash             = require('mano-auth/hash')
  , sendNotification = require('../../server/email-notifications/create-account')
  , unserializeObjectRecord = require('../../server/utils/unserialize-object-record')

  , dbDriver = mano.dbDriver
  , maxage = 1000 * 60 * 60 * 24 * 7
  , customError      = require('es5-ext/error/custom')
  , serializeValue   = require('dbjs/_setup/serialize/value')

  , userStorage = mano.dbDriver.getStorage('user');

exports.login = {
	submit: function (data) {
		var that = this;

		return serverLogin.submit.call(this, data)(function (loginResult) {
			var userId = that.req.$user;

			if (userId) {
				return userStorage.getObject(userId, {
					keyPaths: ['currentBusinessProcess', 'currentlyManagedUser']
				})(unserializeObjectRecord)(function (user) {
					var records = [];

					if (user.currentBusinessProcess) {
						records.push({ id: userId + '/currentBusinessProcess', data: { value: '' } });
					}
					if (user.currentlyManagedUser) {
						records.push({ id: userId + '/currentlyManagedUser', data: { value: '' } });
					}

					return userStorage.storeMany(records);
				})(function () {
					return loginResult;
				});
			}

			return loginResult;
		});
	}
};
exports.register = {
	submit: function (data) {
		if (data.isManager) {
			data['User#/roles'] = ['manager'];
			delete data.isManager;
		}

		return registerSubmit.apply(this, arguments)(function (result) {
			dbDriver.onDrain(function () { sendNotification(data).done(null, function (err) {
				console.log("Cannot send email", err, err.stack);
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
		return userStorage.searchOne({ keyPath: 'createManagedAccountToken',
			value: serializeValue(data['create-managed-account-token']) }, function (id) {
			return id.split('/')[0];
		}).then(function (userId) {
			if (!userId) {
				throw customError("Cannot process request", "MALFORMED_EMAIL", { statusCode: 400 });
			}
			return hash.hash(data.password)(function (password) {
				return userStorage.storeMany([
					{ id: userId + '/createManagedAccountToken', data: { value: '' } },
					{ id: userId + '/password', data: { value: serializeValue(password) } },
					{ id: userId + '/createAccountToken', data: { value: '' } }
				]).then(function () {
					userStorage.getObject(userId,
						{ keyPaths: ['firstName', 'lastName', 'email'] }
						).done(function (resultRaw) {
						sendNotification(unserializeObjectRecord(resultRaw)).done(null, function (err) {
							console.log("Cannot send email", err.stack);
						});
					});
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
			this.userId = userId;
			return promise(function () {
				this.res.cookies.set(cookieName, userId, { maxage: maxage });
				login(userId, this.req, this.res);
			}.bind(this));
		}.bind(this));
	},
	redirectUrl: '/'
};
