'use strict';

var db = require('mano').db;

module.exports = function (businessProcessId, stepName) {
	var businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (!businessProcess) return;
	if (!businessProcess.processingSteps.map[stepName].isPending) return;

	this.businessProcess = businessProcess;
	if (this.businessProcess) {
		this.processingStep = this.businessProcess.processingSteps.map[stepName];
	}
};
