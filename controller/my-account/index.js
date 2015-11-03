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
		this.businessProcess = businessProcess;
		return true;
	},
	submit: function () {
		db.objects.delete(this.businessProcess);
	}
};

exports['business-process/[0-9][a-z0-9]+'] = {
	match: function (businessProcessId) {
		this.businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!this.businessProcess) return false;
		if (!this.businessProcess.isFromEregistrations) return false;
		return this.user.businessProcesses.has(this.businessProcess);
	},
	submit: function () {
		this.user.currentBusinessProcess = this.businessProcess;
	}
};
