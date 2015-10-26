// Standard matcher for official apps routes.
'use strict';

var db = require('mano').db;

module.exports = function (step) {
	return function (businessProcessId) {
		this.businessProcess = db.BusinessProcess.getById(businessProcessId);

		if (this.businessProcess) {
			if (typeof step === 'function') {
				this.processingStep = step.call(this);
			} else {
				this.processingStep = this.businessProcess.processingSteps.map[step];
			}
			return this.processingStep && this.processingStep.isReady;
		}

		return false;
	};
};
