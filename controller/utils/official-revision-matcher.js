'use strict';

var db = require('mano').db;

module.exports = function (businessProcessId) {
	var businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (!businessProcess) return;
	if (!businessProcess.processingSteps.map.revision.isPending) return;

	this.businessProcess = businessProcess;
	if (this.businessProcess) {
		this.processingStep = this.businessProcess.processingSteps.map.revision;
	}
};
