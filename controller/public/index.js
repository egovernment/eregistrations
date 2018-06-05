'use strict';

var copyDeep               = require('es5-ext/object/copy-deep')
  , customError            = require('es5-ext/error/custom')
  , isId                   = require('time-uuid/is-time-uuid')
  , passwordValidation     = require('mano-auth/utils/password-validation')
  , env                    = require('mano').env
  , externalAuthentication = (env && env.externalAuthentication) || {};

if (!externalAuthentication.loginPage) {
	exports.login = require('mano-auth/controller/login');
	exports.login.formHtmlId = 'login';
}

if (!externalAuthentication.registerPage) {
	exports.register = require('mano-auth/controller/register');
	exports.register.formHtmlId = 'register';
	exports['reset-password'] = require('mano-auth/controller/reset-password');
	exports['request-reset-password'] = require('mano-auth/controller/request-reset-password');
	exports['request-reset-password'].formHtmlId = 'reset-password';
}

exports['create-managed-account'] = {
	validate: function (data) {
		var normalizedData = copyDeep(data);
		normalizedData.password = passwordValidation(data.password, data['password-repeat']);
		delete normalizedData['password-repeat'];
		if (!isId(data['create-managed-account-token'])) {
			throw customError("Cannot process request", "MALFORMED_ID",
				{ statusCode: 400 });
		}
		return normalizedData;
	}
};
