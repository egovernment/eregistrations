'use strict';

exports.login = require('mano-auth/controller/client/login');
exports.register = require('mano-auth/controller/client/register-and-login');
exports['reset-password'] = require('mano-auth/controller/client/reset-password');
exports['request-reset-password'] = require('mano-auth/controller/client/request-reset-password');
exports['create-managed-account'] = {
	remoteSubmit: true,
	processResponse: require('mano-auth/controller/lib/reload-after-sync')
};
