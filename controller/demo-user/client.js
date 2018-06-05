'use strict';

var env                           = require('mano').env
  , isAccountConfirmationDisabled = env && env.isAccountConfirmationDisabled
  , externalAuthentication        = (env && env.externalAuthentication) || {};

module.exports = function () {
	var controllers = {};

	if (!externalAuthentication.registerPage) {
		controllers.register = {
			remoteSubmit: true,
			processResponse: function () {
				if (isAccountConfirmationDisabled) return;
				location.href = '/logout/?redirect=/request-confirm-account/';
			}
		};
	}

	if (!externalAuthentication.loginPage) {
		controllers.login = require('mano-auth/controller/client/login');
	}

	return controllers;
};
