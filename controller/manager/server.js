'use strict';

var assign    = require('es5-ext/object/assign')
  , dbObjects = require('mano').db.objects;

// Common
assign(exports, require('../user/server'));

// Delete User
exports['clients/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		this.managedUser.initialBusinessProcesses.forEach(function (bp) {
			dbObjects.delete(bp);
		});
		dbObjects.delete(this.managedUser);
		return true;
	}
};
// Delete Business Process
exports['business-process/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		dbObjects.delete(this.businessProcess);
		return true;
	}
};
