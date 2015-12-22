'use strict';

var db = require('mano').db;

module.exports = function (businessProcessId, stepName) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (!this.businessProcess) return false;

	if (typeof stepName === 'function') {
		stepName = stepName.call(this, this.businessProcess);
	}

	this.processingStep = this.businessProcess.processingSteps.map[stepName];

	if (this.processingStep && this.processingStep.isPending) return true;

	return false;
};
