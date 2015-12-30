// Flow properties of BusinessProcess model

'use strict';

var memoize                     = require('memoizee/plain')
  , defineBusinessProcessStatus = require('../lib/business-process-status')
  , defineGuide                 = require('./guide')
  , defineDataForms             = require('./data-forms')
  , defineRequirementUploads    = require('./requirement-uploads')
  , defineCosts                 = require('./costs')
  , defineSubmissionForms       = require('./submission-forms')
  , defineProcessingSteps       = require('./processing-steps');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineGuide(db, arguments[1])
	  , BusinessProcessStatus = defineBusinessProcessStatus(db);

	defineDataForms(db);
	defineRequirementUploads(db);
	defineCosts(db);
	defineSubmissionForms(db);
	defineProcessingSteps(db);

	BusinessProcess.prototype.defineProperties({
		// Whether business process was submitted to Part B
		isSubmitted: { type: db.Boolean, value: function (_observe) {
			if (this.isSubmittedLocked) return true;
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
		// Whether isSubmitted was locked due to bp being sent for correction
		isSubmittedLocked: { type: db.Boolean, value: false },
		// Whether business process was sent back to Part A
		isSentBack: { type: db.Boolean, value: function (_observe) {
			if (!this.isSubmitted) return false;
			return _observe(this.processingSteps.applicable).some(function (step) {
				return _observe(step._isSentBack);
			});
		} },
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
