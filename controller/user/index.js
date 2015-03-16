'use strict';

var changeOwnPassword = require('mano-auth/controller/change-own-password').validate
  , validate          = require('mano/utils/validate');

// Login
exports.login = require('mano-auth/controller/login');

// Profile
exports.profile = {
	validate: function (data) {
		if (data.password || data['password-new']) return changeOwnPassword.call(this, data);
		delete data.password;
		delete data['password-new'];
		return validate.call(this, data, { partial: true });
	}
};
