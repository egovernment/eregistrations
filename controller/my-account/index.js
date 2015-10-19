// Controller for both server and client.

'use strict';

var assign = require('es5-ext/object/assign')
  , db     = require('mano').db;

// Common controller.
module.exports = assign(exports, require('../user'));

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	match: function (businessProcessId) {
		var businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!businessProcess) return false;
		if (businessProcess.isSubmitted) return false;
		this.target = businessProcess;
		return true;
	},
	submit: function () {
		db.objects.delete(this.target);
	}
};
