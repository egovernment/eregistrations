// Standard matcher for official apps routes.
'use strict';

var db = require('mano').db;

module.exports = function (stepName) {
	return function (businessProcessId) {
		this.businessProcess = db.BusinessProcess.getById(businessProcessId);

		if (this.businessProcess) {
			this.processingStep = this.businessProcess.processingSteps.map[stepName];
			if (!this.processingStep.isReady) return false;
			if (this.processingStep.steps) {
				this.processingStep = this.processingStep.steps.applicable.first;
			}
			return true;
		}

		return false;
	};
};
