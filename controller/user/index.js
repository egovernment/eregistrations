'use strict';

var changeOwnPassword = require('mano-auth/controller/change-own-password').validate
  , validate          = require('mano/utils/validate')
  , assign            = require('es5-ext/object/assign');

assign(exports, require('../common/managed-profile'), require('../common/request-create-account'));

// Profile
exports.profile = {
	validate: function (data) {
		if (data.password || data['password-new']) return changeOwnPassword.call(this, data);
		delete data.password;
		delete data['password-new'];
		delete data['password-repeat'];
		return validate.call(this, data, { partial: true });
	}
};

// Role switch
exports['set-role'] = true;

// Institution switch
exports['set-institution'] = true;

// Active Business Process change
exports['change-business-process'] = true;

// Active Managed User change
exports['change-currently-managed-user'] = true;
