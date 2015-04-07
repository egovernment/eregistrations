'use strict';

var copy          = require('es5-ext/object/copy')
  , oldClientHash = require('mano-auth/utils/client-hash')
  , loginSave     = require('mano-auth/controller/server/login').save
  , registerSave  = require('mano-auth/controller/server/register-and-login').save;

exports.login = copy(require('mano-auth/controller/server/login'));
exports.login.save = function (data) {
	data.password = oldClientHash(data.email, data.password);
	return loginSave.call(this, data);
};
exports.register = copy(require('mano-auth/controller/server/register-and-login'));
exports.register.save = function (data, env) {
	data['User#/password'] = oldClientHash(data['User#/email'], data['User#/password']);
	return registerSave.call(this, data);
};
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');
