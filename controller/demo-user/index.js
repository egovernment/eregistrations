// Registration controller used by Demo users.

'use strict';

var dbjsValidate           = require('mano/lib/utils/dbjs-form-validate')
  , passwordValidation     = require('mano-auth/utils/password-validation')
  , env                    = require('mano').env
  , externalAuthentication = (env && env.externalAuthentication) || {};

module.exports = function () {
	var controllers = {};

	if (!externalAuthentication.registerPage) {
		controllers.register = {
			validate: function (data) {
				var user = this.user
				  , userId = user.__id__;

				dbjsValidate(data, { partial: true });
				data[userId + '/password'] = passwordValidation(data[userId + '/password'],
					data['password-repeat']);

				return data;
			}
		};
	}

	if (!externalAuthentication.loginPage) {
		controllers.login = require('mano-auth/controller/login');
	}

	return controllers;
};
