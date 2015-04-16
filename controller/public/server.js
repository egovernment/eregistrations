'use strict';

var registerSubmit = require('mano-auth/controller/server/register-and-login').submit;

exports.login = require('mano-auth/controller/server/login');
exports.register = require('mano-auth/controller/server/register-and-login');
exports['reset-password'] = require('mano-auth/controller/server/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/server/request-reset-password');

exports.register.submit = function (normalizedData, data) {
	normalizedData['User#/roles'] = ['user'];
	return registerSubmit.apply(this, arguments);
};
