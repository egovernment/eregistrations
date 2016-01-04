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
  , defineProcessingStep        = require('../processing-step');

module.exports = memoize(function (db/*, options*/) {
	var options               = Object(arguments[1])
	  , BusinessProcess       = defineBusinessProcess(db, options)
	  , BusinessProcessStatus = defineBusinessProcessStatus(db)
	  , ProcessingStep;

	defineDataForms(db, options);
	defineRequirementUploads(db, options);
	defineCosts(db, options);
	defineSubmissionForms(db, options);
	defineProcessingSteps(db, options);
	ProcessingStep = defineProcessingStep(db);

	BusinessProcess.prototype.defineProperties({
		// Whether business process was submitted to Part B
		isSubmitted: { type: db.Boolean, value: function (_observe) {
			if (this.isSentBack) return true;
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
		// Whether business process was sent back to Part A
		isSentBack: { type: db.Boolean, value: false },
		sentBackSteps: {
			type: ProcessingStep,
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
		// Whether business process is at draft stage (Part A)
		isAtDraft: { type: db.Boolean, value: function () {
			return !this.isSubmitted || this.isSentBack;
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
