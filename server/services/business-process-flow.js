// Service that propagates business process flow changes

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureIterable  = require('es5-ext/itrable/validate-object')
  , Set             = require('es6-set')
  , ensureType      = require('dbjs/valid-dbjs-type')
  , debug           = require('debug-ext')('business-process-flow')
  , resolveStepPath = require('../../utils/resolve-processing-step-full-path')
  , setupTriggers   = require('../_setup-triggers');

module.exports = function (BusinessProcessType, stepShortPaths) {
	var businessProcesses = ensureType(BusinessProcessType).instances
		.filterByKey('isFromEregistrations', true).filterByKey('isDemo', false);

	var stepPaths = aFrom(ensureIterable(stepShortPaths)).map(resolveStepPath);

	// Business process: isSubmitted
	setupTriggers({
		trigger: businessProcesses.filterByKey('isSubmittedReady', true)
			.filterByKey('isSubmitted', false)
	}, function (businessProcess) {
		debug('%s submitted', businessProcess.__id__);
		businessProcess.isSubmitted = true;
	});

	var businessProcessesSubmitted = businessProcesses.filterByKey('isSubmitted', true);

	// Business process: sentBack finalization
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isSubmittedReady', true)
			.filterByKey('isSentBack', true)
	}, function (businessProcess) {
		debug('%s finalize sentBack', businessProcess.__id__);
		businessProcess.delete('isSentBack');
	});

	// Business process: isUserProcessing finalization
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isSubmittedReady', true)
			.filterByKey('isUserProcessing', true)
	}, function (businessProcess) {
		debug('%s finalize user processing', businessProcess.__id__);
		businessProcess.delete('isUserProcessing');
	});

	// Processing steps:
	stepPaths.forEach(function (stepPath, index) {
		// status
		setupTriggers({
			trigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/status', function (value) {
				return value && (value !== 'pending');
			})
		}, function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath);
			if (step.getOwnDescriptor('status').hasOwnProperty('_value_')) return;
			debug('%s processing step (%s) status set to %s', businessProcess.__id__,
				step.shortPath, step.status);
			step.set('status', step.status);

			if (step.status === 'sentBack') {
				if (businessProcess.isSentBack) return;

				// Sent back initialization
				debug('%s sent back by %s step', businessProcess.__id__, step.shortPath);
				businessProcess.submissionForms.delete('isAffidavitSigned');
				businessProcess.isSentBack = true;

			} else if (step.status === 'redelegated') {

				// Redelegation initialization
				debug('%s redelegated to %s from %s', businessProcess.__id__,
					step.redelegatedTo.shortPath, step.shortPath);
				step.redelegatedTo.delete('officialStatus');
				step.redelegatedTo.delete('status');
				step.redelegatedTo.delete('isSatisfied');

			} else if (step.status === 'rejected') {

				// Business process rejection
				debug('%s rejected at %s', businessProcess.__id__, step.shortPath);
				businessProcess.isRejected = true;
			}
		});

		// isSatisfied
		setupTriggers({
			trigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/isSatisfiedReady', true)
				.filterByKeyPath(stepPath + '/isSatisfied', false)
		}, function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath);
			debug('%s processing step (%s) satisfied', businessProcess.__id__,
				step.shortPath);
			step.isSatisfied = true;
		});

		// Valid returns
		var returnStatuses = new Set(['sentBack', 'redelegated']);
		setupTriggers({
			preTrigger: businessProcessesSubmitted
				.filterByKeyPath(stepPath + '/isPreviousStepsSatisfiedDeep', false),
			trigger: businessProcessesSubmitted
				.filterByKeyPath(stepPath + '/isPreviousStepsSatisfiedDeep', true)
		}, function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath);
			if (!step.isApplicable) return;
			if (step.status === 'pending') return;
			if ((step.statusComputed !== 'pending') && !returnStatuses.has(step.status)) return;
			debug('%s processing step (%s) reset from %s to pending state', businessProcess.__id__,
				step.shortPath, step.status);
			step.delete('officialStatus');
			step.delete('status');
			step.delete('isSatisfied');
		});
	});
};
