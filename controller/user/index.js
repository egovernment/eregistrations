'use strict';

var changeOwnPassword = require('mano-auth/controller/change-own-password').validate
  , validate          = require('mano/utils/validate')
  , customError       = require('es5-ext/error/custom')
  , assign            = require('es5-ext/object/assign');

assign(exports, require('../common/managed-profile'));

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
		// This should not happen in normal application flow
		if (!this.manager) {
			throw customError('Invalid request', 'INVALID_REQUEST');
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
