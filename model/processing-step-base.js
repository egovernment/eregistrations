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
			return Boolean(this.isApplicable && this.isPreviousStepsSatisfied);
		} },

		// Whether process is pending at step
		isPending: { type: db.Boolean },

		// Whether process is paused at step
		isPaused: { type: db.Boolean },

		// Whether process was sent back from this step
		isSentBack: { type: db.Boolean },

		// Whether process was re delegated from this step
		isRedelegated: { type: db.Boolean },

		// Whether process was rejected at this step
		isRejected: { type: db.Boolean },

		// Whether process successfully passed this step
		isApproved: { type: db.Boolean },

		// Whether processing of this step has ended
		isClosed: { type: db.Boolean, value: function (_observe) {
			return this.isApproved || this.isRejected || false;
		} },

		isPreviousStepsSatisfied: { type: db.Boolean, value: function (_observe) {
			if (!this.previousSteps.size) {
				return _observe(this.master._isSubmitted);
			}
			return this.previousSteps.every(function (step) {
				return _observe(step._isSatisfied);
			});
		} },

		isSatisfied: { type: db.Boolean, value: function () {
			if (this.isApplicable) {
				return Boolean(this.isApproved || this.delegatedFrom);
			}
			return this.isPreviousStepsSatisfied;
		} }
	});

	ProcessingStepBase.prototype.define('previousSteps', {
		type: ProcessingStepBase,
		multiple: true
	});

	return ProcessingStepBase;
}, { normalizer: require('memoizee/normalizers/get-1')() });
