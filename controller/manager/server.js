'use strict';

var assign      = require('es5-ext/object/assign')
  , dbObjects   = require('mano').db.objects
  , customError = require('es5-ext/error/custom');

// Common
assign(exports, require('../user/server'));

// Delete User
exports['clients/[0-9][a-z0-9]+/delete'] = {
	validate: function (data) {
		if (!this.user.managedUsers.has(this.managedUser)) {
			throw customError("Not a managed user", 'NOT_MANAGED_USER');
		}
		if (!this.managedUser.canManagedUserBeDestroyed) {
			throw customError("Managed user cannot be removed", 'CANNOT_REMOVE_MANAGED_USER');
		}

		return data;
	},
	submit: function () {
		return this.managedUser._destroy();
	}
};
// Delete Business Process
exports['business-process/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		dbObjects.delete(this.businessProcess);
		return true;
	}
};
// Ensure that when legacy render, we land at root url after reload
exports['business-process/[0-9][a-z0-9]+'] = { redirectUrl: '/' };
exports['clients/[0-9][a-z0-9]+'] = { redirectUrl: '/' };
