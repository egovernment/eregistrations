// List of computed properties used in statistics rejections table columns.

'use strict';

var db  = require('mano').db
  , Set = require('es6-set');

module.exports = new Set([
	'businessName',
	'status'
]);

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	BusinessProcess.prototype.processingSteps.map.forEach(function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			step.steps.map.forEach(self);
			return;
		}
		module.exports.add(step.__id__.slice(step.master.__id__.length + 1) + '/status');
	});
});
