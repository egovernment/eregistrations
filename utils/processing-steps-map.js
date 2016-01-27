// Meta data for business processes states applicable for this app

'use strict';

var db      = require('mano').db
  , forEach = require('es5-ext/object/for-each')
  , meta;

module.exports = meta = {};

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	BusinessProcess.prototype.processingSteps.map.forEach(function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			step.steps.map.forEach(self);
			return;
		}
		meta[step.shortPath] = { label: step.label };
	});
});

forEach(meta, function (conf, name) {
	conf.indexName = 'processingSteps/map/' + name + '/resolvedStatus';
	conf.indexValue = 'pending';
});
