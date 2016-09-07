// Service that propagates business process flow changes
//
// Most updates are delayed to next tick, so eventual preTrigger setups have chance to catch up
// for cases when file is loaded in inconsistent state.
// There exists a complementary service copy-is-ready which handles isReady of stepd

'use strict';

var aFrom           = require('es5-ext/array/from')
  , ensureIterable  = require('es5-ext/iterable/validate-object')
  , ensureCallable  = require('es5-ext/object/valid-callable')
  , Set             = require('es6-set')
  , ensureType      = require('dbjs/valid-dbjs-type')
  , debug           = require('debug-ext')('business-process-flow')
  , delay           = require('timers-ext/delay')
  , resolveStepPath = require('../../utils/resolve-processing-step-full-path')
  , setupTriggers   = require('../_setup-triggers');

module.exports = function (BusinessProcessType, stepShortPaths/*, options*/) {
	var businessProcesses = ensureType(BusinessProcessType).instances
		.filterByKey('isFromEregistrations', true).filterByKey('isDemo', false)
	  , options = Object(arguments[2])
	  , customStepReturnHandler, onSubmitted, onStepRedelegate, onStepStatus, onUserProcessingEnd;

	if (options.customStepReturnHandler != null) {
		customStepReturnHandler = ensureCallable(options.customStepReturnHandler);
	}
	if (options.onStepRedelegate != null) onStepRedelegate = ensureCallable(options.onStepRedelegate);
	if (options.onStepStatus != null) onStepStatus = ensureCallable(options.onStepStatus);
	if (options.onSubmitted != null) onSubmitted = ensureCallable(options.onSubmitted);
	if (options.onUserProcessingEnd != null) {
		onUserProcessingEnd = ensureCallable(options.onUserProcessingEnd);
	}

	var stepPaths = aFrom(ensureIterable(stepShortPaths)).map(function (shortPath) {
		return 'processingSteps/map/' + resolveStepPath(shortPath);
	});

	// Business process: isSubmitted
	setupTriggers({
		trigger: businessProcesses.filterByKey('isSubmittedReady', true)
			.filterByKey('isSubmitted', false)
	}, delay(function (businessProcess) {
		debug('%s submitted', businessProcess.__id__);
		if (onSubmitted) onSubmitted(businessProcess);
		businessProcess.isSubmitted = true;
	}));
	setupTriggers({
		trigger: businessProcesses.filterByKey('isSubmitted', true)
	}, function (businessProcess) {
		if (!businessProcess.dataForms.dataSnapshot.jsonString) {
			debug('%s generate initial data snapshots', businessProcess.__id__);
		}
		businessProcess.dataForms.dataSnapshot.generate();
		businessProcess.requirementUploads.dataSnapshot.generate();
		businessProcess.paymentReceiptUploads.dataSnapshot.generate();
	});

	var businessProcessesSubmitted = businessProcesses.filterByKey('isSubmitted', true);

	// Business process: sentBack finalization
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isSubmittedReady', true)
			.filterByKey('isSentBack', true)
	}, delay(function (businessProcess) {
		debug('%s finalize sentBack', businessProcess.__id__);
		businessProcess.delete('isSentBack');
		businessProcess.dataForms.dataSnapshot.regenerate();
		businessProcess.requirementUploads.dataSnapshot.regenerate();
		businessProcess.paymentReceiptUploads.dataSnapshot.regenerate();
	}));

	// Business process: isUserProcessing initialization
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isUserProcessingReady', true)
			.filterByKey('isUserProcessing', false)
	}, delay(function (businessProcess) {
		debug('%s initialize user processing', businessProcess.__id__);
		businessProcess.submissionForms.delete('isAffidavitSigned');
		businessProcess.isUserProcessing = true;
	}));

	// Business process: isUserProcessing finalization
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isSubmittedReady', true)
			.filterByKey('isUserProcessing', true)
	}, delay(function (businessProcess) {
		debug('%s finalize user processing', businessProcess.__id__);
		if (onUserProcessingEnd) onUserProcessingEnd(businessProcess);
		businessProcess.delete('isUserProcessing');
		businessProcess.dataForms.dataSnapshot.regenerate();
		businessProcess.requirementUploads.dataSnapshot.regenerate();
		businessProcess.paymentReceiptUploads.dataSnapshot.regenerate();
	}));

	// Business process: isApproved preservation
	setupTriggers({
		trigger: businessProcessesSubmitted.filterByKey('isApprovedReady', true)
			.filterByKey('isApproved', false)
	}, delay(function (businessProcess) {
		debug('%s approved', businessProcess.__id__);
		businessProcess.isApproved = true;
	}));
	setupTriggers({
		trigger: businessProcesses.filterByKey('isClosed', true)
	}, function (businessProcess) {
		if (!businessProcess.certificates.dataSnapshot.jsonString) {
			debug('%s generate certificates data snapshots', businessProcess.__id__);
		}
		businessProcess.certificates.dataSnapshot.generate();
		businessProcess.dataForms.dataSnapshot.finalize();
		businessProcess.requirementUploads.dataSnapshot.finalize();
		businessProcess.paymentReceiptUploads.dataSnapshot.finalize();
	});

	// Processing steps:
	var nonFinalStatuses = new Set(['pending', 'paused']);
	stepPaths.forEach(function (stepPath, index) {
		// status
		setupTriggers({
			trigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/status', function (value) {
				return value && !nonFinalStatuses.has(value);
			})
		}, delay(function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath), targetStep;
			if (step.hasOwnProperty('status')) return; // Already shadowed
			debug('%s %s step %s', businessProcess.__id__, step.shortPath, step.status);
			if (onStepStatus) onStepStatus(step);
			// There exists a complementary service (copy-is-ready) which handles setup of isReady
			if (step.revisionStatus && !nonFinalStatuses.has(step.revisionStatus)) {
				step.set('revisionStatus', step.revisionStatus);
			}
			step.set('status', step.status);

			if (step.status === 'sentBack') {
				if (businessProcess.isSentBack) return;

				// Sent back initialization
				debug('%s sent back by %s step', businessProcess.__id__, step.shortPath);
				businessProcess.submissionForms.delete('isAffidavitSigned');
				businessProcess.isSentBack = true;

			} else if (step.status === 'redelegated') {

				// Redelegation initialization
				targetStep = step.redelegatedTo;
				debug('%s redelegated to %s from %s', businessProcess.__id__,
					targetStep.shortPath, step.shortPath);
				if (onStepRedelegate) onStepRedelegate(step);
				if (targetStep.hasOwnProperty('revisionOfficialStatus')) {
					targetStep.delete('revisionOfficialStatus');
				}
				targetStep.delete('officialStatus');
				if (targetStep.hasOwnProperty('revisionStatus')) targetStep.delete('revisionStatus');
				targetStep.delete('status');
				if (targetStep.hasOwnProperty('isSatisfied')) targetStep.delete('isSatisfied');
			} else if (step.status === 'rejected') {

				// Business process rejection
				debug('%s rejected at %s', businessProcess.__id__, step.shortPath);
				businessProcess.isRejected = true;
			}
		}));

		// isSatisfied
		setupTriggers({
			trigger: businessProcessesSubmitted.filterByKeyPath(stepPath + '/isSatisfiedReady', true)
				.filterByKeyPath(stepPath + '/isSatisfied', false)
		}, delay(function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath);
			debug('%s %s step satisfied', businessProcess.__id__, step.shortPath);
			step.isSatisfied = true;
		}));

		// Valid returns
		var returnStatuses = new Set(['sentBack', 'redelegated']);
		setupTriggers({
			preTrigger: businessProcessesSubmitted
				.filterByKeyPath(stepPath + '/isPreviousStepsSatisfiedDeep', false),
			trigger: businessProcessesSubmitted
				.filterByKeyPath(stepPath + '/isPreviousStepsSatisfiedDeep', true)
		}, function (businessProcess) {
			var step = businessProcess.getBySKeyPath(stepPath)
			  , returnHandlerResult;

			if (!step.isApplicable) return;
			if (!step.status || (step.status === 'pending')) return;

			if (customStepReturnHandler) {
				returnHandlerResult = customStepReturnHandler(step);
			}

			if (returnHandlerResult == null) {
				if (step.statusComputed && (step.statusComputed !== 'pending') &&
						!returnStatuses.has(step.status)) {
					return;
				}
			} else if (!returnHandlerResult) {
				// Skip if customStepReturnHandler 'explicitly' decided so
				return;
			}

			debug('%s %s step reset from %s to pending state', businessProcess.__id__,
				step.shortPath, step.status);
			if (step.hasOwnProperty('revisionOfficialStatus')) step.delete('revisionOfficialStatus');
			step.delete('officialStatus');
			if (step.hasOwnProperty('revisionStatus')) step.delete('revisionStatus');
			step.delete('status');
			if (step.hasOwnProperty('isSatisfied')) step.delete('isSatisfied');
		});
	});
};
