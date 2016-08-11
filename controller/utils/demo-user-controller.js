// Registration controller used by Demo users.

'use strict';

var dbjsValidate       = require('mano/lib/utils/dbjs-form-validate')
  , passwordValidation = require('mano-auth/utils/password-validation');

module.exports = function (controllers) {
	controllers.register = {
		validate: function (data) {
			var user   = this.user
			  , userId = user.__id__;

			dbjsValidate(data, { partial: true });
			console.log('DATA BEFORE VALIDATE', data);
			data[userId + '/password'] = passwordValidation(data[userId + '/password'],
				data['password-repeat']);

			return data;
		}
	};
};
