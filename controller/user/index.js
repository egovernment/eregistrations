'use strict';

var changeOwnPassword = require('mano-auth/controller/change-own-password').validate
  , validate          = require('mano/utils/validate')
  , customError       = require('es5-ext/error/custom');

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

exports['request-create-managed-account'] = {
	validate: function (data) {
		if (!this.manager) {
			throw customError('Not a manager', 'PERMISSION_DENIED');
		}
		return validate.call(this, data);
	}
};

// Role switch
exports['set-role'] = true;

// Active Business Process change
exports['change-business-process'] = true;

// Active Managed User change
exports['change-currently-managed-user'] = true;
