// Processing step base class
// It is extended either by ProcessingStep or ProcessingStepGroup
// Describes the process of official role (like revision, processing or front desk)

'use strict';

var memoize           = require('memoizee/plain')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineCreateEnum  = require('dbjs-ext/create-enum')
  , defineInstitution = require('./institution');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Institution = defineInstitution(db)
	  , ProcessingStepBase;

	defineCreateEnum(db);

	ProcessingStepBase = db.Object.extend('ProcessingStepBase', {
		// Label (name) of processing step
		label: { type: StringLine },
		// If step is processed by single institution
		// then instution should be exposed here
		institution: { type: Institution },

		// Can be used in subStep of a group to retrieve parent
		// Type is overriden to ProcessingStepGroup in processing-step-group.js file
		parentGroup: { type: db.Object, value: function () {
			var ProcessingStepGroup, parentGroup;
			ProcessingStepGroup = this.database.ProcessingStepGroup;
			if (!ProcessingStepGroup) {
				throw new Error("The ProcessingStepGroup is not defined in db!");
			}
				// we take first owner who is a person
			parentGroup = this.owner;
			while (parentGroup && !ProcessingStepGroup.is(parentGroup)) {
				parentGroup = parentGroup.owner;
			}
			return parentGroup;
		} },

		// Whether given step applies at all
		isApplicable: { type: db.Boolean, value: true },

		// Whether business process is at given step or have passed it
		isReady: { type: db.Boolean, value: function (_observe) {
			if (!this.isApplicable) return false;
			if (!this.isPreviousStepsSatisfied) return false;
			// If step was not yet processed but file was already closed do not provide it
			if (this.officialStatus) return true;
			return !_observe(this.master._isClosed);
		} },

		// Whether process is pending at step
		isPending: { type: db.Boolean },

		// Whether process is paused at step
		isPaused: { type: db.Boolean },

		// Whether process was sent back from this step
		isSentBack: { type: db.Boolean },

		// Whether process was redelegated from this step
		isRedelegated: { type: db.Boolean },

		// Whether process was rejected at this step
		isRejected: { type: db.Boolean },

		// Whether process successfully passed this step
		isApproved: { type: db.Boolean },

		// Whether processing of this step has ended
		isClosed: { type: db.Boolean, value: function (_observe) {
			return this.isApproved || this.isRejected || false;
		} },

		// Whether all previous steps are satisfied (not applicable or successfully passed)
		isPreviousStepsSatisfied: { type: db.Boolean, value: function (_observe) {
			if (!this.previousSteps.size) return _observe(this.master._isSubmitted);
			return this.previousSteps.every(function (step) {
				return _observe(step._isSatisfied) && _observe(step._isPreviousStepsSatisfied);
			});
		} },

		// Whether all previous steps are satisfied (not applicable or successfully passed)
		// With respect to Part A handling. No steps will resolve as satisfied if file
		// is at draft stage (not submitted, send back or at user processing step)
		// This one is needed for handling valid returns by business-process-flow service
		isPreviousStepsSatisfiedDeep: { type: db.Boolean, value: function (_observe) {
			if (!this.previousSteps.size) return !_observe(this.master._isAtDraft);
			return this.previousSteps.every(function (step) {
				return _observe(step._isSatisfied) && _observe(step._isPreviousStepsSatisfiedDeep);
			});
		} },

		// Whether this step is complete (not applicable or fully and successfully passed)
		isSatisfiedReady: { type: db.Boolean, value: function () {
			if (this.isApplicable) return Boolean(this.isApproved);
			return this.isPreviousStepsSatisfied;
		} },

		// Whether this step was succesfully passed
		// Set to true by server service when isSatisfiedReady turns true
		isSatisfied: { type: db.Boolean, value: false },

		// maps key to shorter version e.g. processingSteps/map/revision/steps/map/oni -> revision/oni
		//                                  processingSteps/map/revision               -> revision
		shortPath: {
			type: StringLine,
			value: function () {
				return this.__id__.split('/map/').slice(1).map(function (part) {
					return part.replace(/\/steps$/, '');
				}).join('/');
			}
		}
	});

	ProcessingStepBase.prototype.define('previousSteps', {
		type: ProcessingStepBase,
		multiple: true
	});

	return ProcessingStepBase;
}, { normalizer: require('memoizee/normalizers/get-1')() });
