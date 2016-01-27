// Meta data for business processes states applicable for this app

'use strict';

var db      = require('mano').db
  , meta;

module.exports = meta = {};

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	BusinessProcess.prototype.processingSteps.map.forEach(function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			step.steps.map.forEach(self);
			return;
		}
		meta[step.shortPath] = {
			label: step.label,
			indexName: step.__id__.slice(step.master.__id__.length + 1) + '/resolvedStatus',
			indexValue: 'pending'
		};
	});
});
