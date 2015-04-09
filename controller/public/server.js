'use strict';

var registerSave = require('mano-auth/controller/server/register-and-login').save;

exports.login = require('mano-auth/controller/server/login');
exports.register = require('mano-auth/controller/server/register-and-login');
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');

exports.register.save = function (normalizedData, data) {
	normalizedData['User#/roles'] = ['user'];
	return registerSave.apply(this, arguments);
};
