'use strict';

exports.login = require('mano-auth/controller/login');
exports.register = require('mano-auth/controller/register');
exports['add-user'] = {
	validate: require('mano-auth/controller/register').validate,
	redirectUrl: '/'
};
exports['reset-password'] = require('mano-auth/controller/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/request-reset-password');
