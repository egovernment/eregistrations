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
	validate: Function.prototype
};

exports['business-process/[0-9][a-z0-9]+'] = {
	match: function (businessProcessId) {
		this.businessProcess = db.BusinessProcess.getById(businessProcessId);
		if (!this.businessProcess) return false;
		if (!this.businessProcess.isFromEregistrations) return false;
		return this.user.businessProcesses.has(this.businessProcess);
	},
	submit: function () {
		if (this.manager) {
			this.manager.currentBusinessProcess = this.businessProcess;
		} else {
			this.user.currentBusinessProcess = this.businessProcess;
		}
	}
};

exports.register = require('../demo-user-controller')().register;
