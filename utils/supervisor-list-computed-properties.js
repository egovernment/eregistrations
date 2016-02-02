// List of static properties used in business process table columns

'use strict';

var Set = require('es6-set')
  , db  = require('mano').db
  , bpList = new Set();

module.exports = bpList;

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	BusinessProcess.prototype.processingSteps.map.forEach(function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			step.steps.map.forEach(self);
			return;
		}
		bpList.add(step.__id__.slice(step.master.__id__.length + 1) + '/resolvedStatus');
	});
});
