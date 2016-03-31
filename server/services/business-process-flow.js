'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureIterable  = require('es5-ext/itrable/validate-object')
  , ensureType      = require('dbjs/valid-dbjs-type')
  , debug           = require('debug-ext')('business-process-flow')
  , resolveStepPath = require('../../utils/resolve-processing-step-full-path')
  , setupTriggers   = require('../_setup-triggers');

module.exports = function (BusinessProcessType, stepShortPaths) {
	var businessProcesses = ensureType(BusinessProcessType).instances
		.filterByKey('isFromEregistrations', true).filterByKey('isDemo', false);

	stepShortPaths = aFrom(ensureIterable(stepShortPaths));
	var stepPaths = stepShortPaths.map(resolveStepPath);

	// isSubmitted
	setupTriggers({
		preTrigger: businessProcesses.filterByKey('guideProgress', 1).filterByKey('isSubmitted', false),
		trigger: businessProcesses.filterByKey('isSubmittedReady', true)
	}, function (businessProcess) {
		debug('%s submitted', businessProcess.__id__);
		businessProcess.isSubmitted = true;
	});

	var businessProcessesSubmitted = businessProcesses.filterByKey('isSubmitted', true);

	// Processing step statuses
	stepPaths.forEach(function (stepPath, index) {
		// status
		setupTriggers({
			preTrigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/status', 'pending'),
			trigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/status', function (value) {
				return value && (value !== 'pending');
			})
		}, function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath);
			debug('%s processing step (%s) status set to %s', businessProcess.__id__,
				stepShortPaths[index], step.status);
			step.set('status', step.status);
		});
	});
};
