// Flow properties of BusinessProcess model

'use strict';

var _                           = require('mano').i18n.bind('Model')
  , memoize                     = require('memoizee/plain')
  , Map                         = require('es6-map')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineBusinessProcessStatus = require('../lib/business-process-status')
  , defineBusinessProcess       = require('./guide')
  , defineDataForms             = require('./data-forms')
  , defineRequirementUploads    = require('./requirement-uploads')
  , defineCosts                 = require('./costs')
  , defineSubmissionForms       = require('./submission-forms')
  , defineProcessingSteps       = require('./processing-steps')
  , defineUInteger              = require('dbjs-ext/number/integer/u-integer')
  , definePerson                = require('../person');

module.exports = memoize(function (db/*, options*/) {
	var options               = Object(arguments[1])
	  , BusinessProcess       = defineBusinessProcess(db, options)
	  , BusinessProcessStatus = defineBusinessProcessStatus(db)
	  , UInteger              = defineUInteger(db)
	  , StringLine            = defineStringLine(db)
	  , Person                = definePerson(db, options);

	defineDataForms(db, options);
	defineRequirementUploads(db, options);
	defineCosts(db, options);
	defineSubmissionForms(db, options);
	defineProcessingSteps(db, options);

	// Enum for submitterType property
	var SubmitterType = StringLine.createEnum('SubmitterType', new Map([
		['user', { label: _("User") }],
		['manager', { label: _("Manager") }]
	]));

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

		// The User that submitted application to Part B
		// This will be the original submitter. If the file was sent back and resubmitted by
		// other user, this property will not change.
		submitter: { type: Person },

		// Set in application-submit controller for registration apps.
		// This will be the original submitter type. If the file was sent back and resubmitted by
		// user of different type, this property will not change.
		submitterType: { type: SubmitterType, value: 'user' },

		// Whether business process was sent back to Part A
		isSentBack: { type: db.Boolean, value: false },

		// Whether business process is ready for being processed by the User (in scope of Part B)
		// To be replaced with proper logic at end system
		//
		// As user processing resembles steps like 'sentBack' or 'redelegated',
		// this property (not like isSubmitted) should switch resolution value to *false*
		// when user processing is finalized.
		// Technically (with help of locker properties that are out of scope of base model)
		// it can be configured to handle more than one user processing step.
		isUserProcessingReady: { type: db.Boolean, value: false },

		// Whether business process is being process by User (in scope of Part B)
		// Set to true by server service whenever isUserProcessingReady turns true
		isUserProcessing: { type: db.Boolean, value: false },

		// Whether business process is at draft stage (Part A)
		isAtDraft: { type: db.Boolean, value: function () {
			return !this.isSubmitted || this.isSentBack || this.isUserProcessing;
		} },
		// Whether business is approved
		isApprovedReady: { type: db.Boolean, value: function (_observe) {
			if (!this.isSubmitted) return false;
			return _observe(this.processingSteps.applicable).every(function (step) {
				return _observe(step._isApproved);
			});
		} },
		// Whether business process was approved
		// Set to true by server service when isApprovedReady turns true
		isApproved: { type: db.Boolean, value: false },
		// Whether business process was rejected
		// Set to true by server service when first processing step is rejected
		isRejected: { type: db.Boolean, value: false },

		// Whether business process is closed
		isClosed: { type: db.Boolean, value: function (_observe) {
			return this.isRejected || this.isApproved;
		} },
		// Computed status of registration
		status: { type: BusinessProcessStatus, value: function (_observe) {
			var frontDesk;
			if (!this.isSubmitted) return 'draft';
			if (this.isSentBack) return 'sentBack';
			if (this.isRejected) return 'rejected';
			if (this.isClosed) return 'closed';

			frontDesk = this.processingSteps.map.frontDesk;
			if (frontDesk && _observe(frontDesk._isApproved)) return 'withdrawn';
			if (frontDesk && _observe(frontDesk._isPending)) return 'pickup';

			if (this.processingSteps.revisions.some(function (processingStep) {
					return _observe(processingStep._isRevisionPending);
				})) {
				return 'revision';
			}

			return 'process';
		} },
		correctionTime: { type: UInteger, value: 0 },
		processingHolidaysTime: { type: UInteger, value: 0 }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
