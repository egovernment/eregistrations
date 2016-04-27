'use strict';

var db = require('mano').db;

module.exports = function (businessProcessId, stepName) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (!this.businessProcess) return false;

	if (typeof stepName === 'function') {
		this.processingStep = stepName.call(this, this.businessProcess);
	} else {
		this.processingStep = this.businessProcess.processingSteps.map[stepName];
	}

	if (!this.processingStep) return false;
	if (this.processingStep.assignee && (this.user !== this.processingStep.assignee)) return false;

	return this.processingStep.isPending;
};
