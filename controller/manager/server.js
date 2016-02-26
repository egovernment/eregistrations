'use strict';

var assign    = require('es5-ext/object/assign')
  , dbObjects = require('mano').db.objects;

// Common
assign(exports, require('../user/server'));

// Delete User
exports['clients/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		this.client.initialBusinessProcesses.forEach(function (bp) {
			dbObjects.delete(bp);
		});
		dbObjects.delete(this.client);
		return true;
	}
};
