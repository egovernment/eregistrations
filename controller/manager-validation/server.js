'use strict';

var assign      = require('es5-ext/object/assign')
  , customError = require('es5-ext/error/custom');

// Common
assign(exports, require('../user/server'));

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	validate: function (data) {
		if ((!this.user.roles.has('managerValidation') && !(this.user.roles.has('usersAdmin')))
				|| !this.target.canBeDestroyed) {
			throw customError("Manager cannot be removed", 'CANNOT_REMOVE_MANAGER');
		}
		return data;
	},
	submit: function () {
		return this.target._destroy();
	}
};
