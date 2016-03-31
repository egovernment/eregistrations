// Flow properties of BusinessProcess model

'use strict';

var memoize                     = require('memoizee/plain')
  , defineBusinessProcessStatus = require('../lib/business-process-status')
  , defineBusinessProcess       = require('./guide')
  , defineDataForms             = require('./data-forms')
  , defineRequirementUploads    = require('./requirement-uploads')
  , defineCosts                 = require('./costs')
  , defineSubmissionForms       = require('./submission-forms')
  , defineProcessingSteps       = require('./processing-steps')
  , defineProcessingStepBase    = require('../processing-step-base');

module.exports = memoize(function (db/*, options*/) {
	var options               = Object(arguments[1])
	  , BusinessProcess       = defineBusinessProcess(db, options)
	  , BusinessProcessStatus = defineBusinessProcessStatus(db)
	  , ProcessingStepBase;

	defineDataForms(db, options);
	defineRequirementUploads(db, options);
	defineCosts(db, options);
	defineSubmissionForms(db, options);
	defineProcessingSteps(db, options);
	ProcessingStepBase = defineProcessingStepBase(db);

	BusinessProcess.prototype.defineProperties({

		// Whether file is complete at Part A and submitted to Part B
		isSubmittedReady: { type: db.Boolean, value: function (_observe) {
			// 0. Guide
			if (this.guideProgress !== 1) return false;
			// 1. Forms
			if (_observe(this.dataForms._progress) !== 1) return false;
			// 2. Uploads
			if (_observe(this.requirementUploads._progress) !== 1) return false;
			// 3. Payments
			if (_observe(this.costs._paymentProgress) !== 1) return false;
			// 4. Submission
			if (_observe(this.submissionForms._progress) !== 1) return false;
			return true;
		} },

		// Whether file was submitted to Part B
		// Set to true by server service on first successful request submission
		// (technically: whenever isSubmittedReady turns true for very first time)
		isSubmitted: { type: db.Boolean, value: false },

		// Whether business process was sent back to Part A
		isSentBack: { type: db.Boolean, value: false },
		sentBackSteps: {
			type: ProcessingStepBase,
			multiple: true,
			value: function (_observe) {
				var res = [];
				if (!this.isSubmitted) return res;

				_observe(this.processingSteps.applicable).forEach(function (step) {
					if (_observe(step._isSentBack)) res.push(step);
				});

				return res;
			}
		},
		// Whether business process in being processed by the User after submission
		isUserProcessing: { type: db.Boolean, value: false },
		// Whether business process is at draft stage (Part A)
		isAtDraft: { type: db.Boolean, value: function () {
			return !this.isSubmitted || this.isSentBack || this.isUserProcessing;
		} },
		// Whether business is approved
		isApproved: { type: db.Boolean, value: function (_observe) {
			if (!this.isSubmitted) return false;
			return _observe(this.processingSteps.applicable).every(function (step) {
				return _observe(step._isApproved);
			});
		} },
		// Whether business process was rejected
		isRejected: { type: db.Boolean, value: function (_observe) {
			if (!this.isSubmitted) return false;
			return _observe(this.processingSteps.applicable).some(function (step) {
				return _observe(step._isRejected);
			});
		} },
		// Whether business process is closed
		isClosed: { type: db.Boolean, value: function (_observe) {
			if (!this.isSubmitted) return false;
			return _observe(this.processingSteps.applicable).every(function (step) {
				if (!_observe(step._isReady)) return true;
				return _observe(step._isClosed);
			});
		} },
		// Computed status of registration
		status: { type: BusinessProcessStatus, value: function (_observe) {
			var frontDesk;
			if (!this.isSubmitted) return 'draft';
			if (this.isSentBack) return 'sentBack';
			if (this.isClosed) return 'closed';
			frontDesk = this.processingSteps.map.frontDesk;
			if (frontDesk && _observe(frontDesk._isPending)) return 'pickup';
			return 'process';
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
