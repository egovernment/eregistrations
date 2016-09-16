'use strict';

var assign    = require('es5-ext/object/assign')
  , dbObjects = require('mano').db.objects;

// Common
assign(exports, require('../user/server'));

// Delete User
exports['clients/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		if (!this.user.managedUsers.has(this.managedUser)) return;
		if (!this.managedUser.canManagedUserBeDestroyed) return;

		return this.managedUser.destroy();
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
