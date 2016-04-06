// Processing step group class
// Describes group of official role processes
// It's used to group processes of same kind
// e.g. in Salvador revision, processing, and withdrawal steps is internally separated
// into sub steps by instituition

'use strict';

var memoize                  = require('memoizee/plain')
  , defineMultipleProcess    = require('./lib/multiple-process')
  , defineProcessingStepBase = require('./processing-step-base');

module.exports = memoize(function (db) {
	var MultipleProcess = defineMultipleProcess(db)
	  , ProcessingStepBase = defineProcessingStepBase(db);

	var ProcessingStepGroup = ProcessingStepBase.extend('ProcessingStepGroup', {
		// Sub steps of processingStepGroup
		steps: { type: MultipleProcess, nested: true },

		// Whether business process is at given step or have passed it
		isReady: { type: db.Boolean, value: function (_observe) {
			if (!this.isApplicable) return false;
			if (!this.isPreviousStepsSatisfied) return false;
			// If step was not yet processed but file was rejected do not provide it
			if (_observe(this.steps.applicable).some(function (step) {
					return _observe(step._officialStatus);
				})) {
				return true;
			}
			return !_observe(this.master._isRejected);
		} },

		// Whether process group is pending at some sub step
		isPending: { value: function (_observe) {
			if (!this.isReady) return false;
			if (this.isRejected) return false;
			return _observe(this.steps.applicable).some(function (step) {
				return _observe(step._isPending);
			});
		} },

		// Whether process group is paused at some sub step
		isPaused: { value: function (_observe) {
			if (!this.isReady) return false;
			if (this.isRejected) return false;
			return _observe(this.steps.applicable).some(function (step) {
				return _observe(step._isPaused);
			});
		} },

		// Whether process group was sent back at some sub step
		isSentBack: { value: function (_observe) {
			return _observe(this.steps.applicable).some(function (step) {
				return _observe(step._isSentBack);
			});
		} },

		// Whether process group was redelegated at some sub step
		isRedelegated: { value: function (_observe) {
			if (!this.isReady) return false;
			if (this.isRejected) return false;
			return _observe(this.steps.applicable).some(function (step) {
				return _observe(step._isRedelegated);
			});
		} },

		// Whether process group was rejected at some step
		isRejected: { value: function (_observe) {
			if (!this.isReady) return false;
			return _observe(this.steps.applicable).some(function (step) {
				return _observe(step._isRejected);
			});
		} },

		// Whether process successfully passed this step group
		isApproved: { value: function (_observe) {
			if (!this.isReady) return false;
			return _observe(this.steps.applicable).every(function (step) {
				return _observe(step._isApproved);
			});
		} },

		// Satisfied when all steps in group are satisfied
		isSatisfied: { value: function (_observe) {
			return _observe(this.steps.map).every(function (step) {
				return _observe(step._isSatisfied);
			});
		} }
	});

	ProcessingStepGroup.prototype.steps.map._descriptorPrototype_.type = ProcessingStepBase;
	ProcessingStepGroup.prototype.steps.defineProperties({
		// Applicable procesing steps
		applicable: { type: ProcessingStepBase }
	});
	return ProcessingStepGroup;
}, { normalizer: require('memoizee/normalizers/get-1')() });
