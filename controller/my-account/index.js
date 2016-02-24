// Controller for both server and client.

'use strict';

var db     = require('mano').db
  , assign = require('es5-ext/object/assign');

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
		var previous = this.businessProcess.previousBusinessProcess;
		db.objects.delete(this.businessProcess);
		// If it's business update based on business process not coming from eRegistrations
		// then ensure to also delete that base businessProcess
		if (previous && !previous.isFromEregistrations) db.objects.delete(previous);
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

require('../utils/demo-user-controller')(exports);
