// Processing step class
// Describes the process of official role (like revision, processing or front desk)

'use strict';

var Map                        = require('es6-map')
  , memoize                    = require('memoizee/plain')
  , definePercentage           = require('dbjs-ext/number/percentage')
  , defineStringLine           = require('dbjs-ext/string/string-line')
  , defineUInteger             = require('dbjs-ext/number/integer/u-integer')
  , defineCreateEnum           = require('dbjs-ext/create-enum')
  , _                          = require('mano').i18n.bind('Model')
  , defineUser                 = require('./user/base')
  , defineFormSectionBase      = require('./form-section-base')
  , defineProcessingStepBase   = require('./processing-step-base')
  , defineUploadsProcess       = require('./lib/uploads-process')
  , defineMultipleProcess      = require('./lib/multiple-process')
  , definePaymentReceiptUpload = require('./payment-receipt-upload')
  , defineRequirementUpload    = require('./requirement-upload')
  , defineDocument             = require('./document');

module.exports = memoize(function (db) {
	var Percentage           = definePercentage(db)
	  , StringLine           = defineStringLine(db)
	  , UInteger             = defineUInteger(db)
	  , MultipleProcess      = defineMultipleProcess(db)
	  , User                 = defineUser(db)
	  , FormSectionBase      = defineFormSectionBase(db)
	  , ProcessingStepBase   = defineProcessingStepBase(db)
	  , UploadsProcess       = defineUploadsProcess(db)
	  , PaymentReceiptUpload = definePaymentReceiptUpload(db)
	  , RequirementUpload    = defineRequirementUpload(db)
	  , Document             = defineDocument(db)

	  , ProcessingStep       = ProcessingStepBase.extend('ProcessingStep');

	defineCreateEnum(db);

	// Enum for processing step status
	var ProcessingStepStatus = StringLine.createEnum('ProcessingStepStatus', new Map([
		['pending', { label: _("Pending") }],
		['paused', { label: _("Paused") }],
		['sentBack', { label: _("Sent back") }],
		['rejected', { label: _("Rejected") }],
		['approved', { label: _("Approved") }],
		['redelegated', { label: _("Redelegated") }]
	]));

	ProcessingStep.prototype.defineProperties({
		// Official that processed request at given processing step
		processor: { type: User },

		// Processing step form fields section (applies only to approved status)
		dataForm: { type: FormSectionBase, nested: true },
		// Eventual reason of file been sent back
		sendBackReason: { type: db.String, required: true },
		// Eventual reason of rejection
		rejectionReason: { type: db.String, required: true, label: _("Rejection reason") },
		// Reason of redelegation
		redelegationReason: { type: db.String, required: true },
		// Final status as decided by official
		// Note: 'pending' option doesn't apply here, as it's not a final status
		officialStatus: { type: ProcessingStepStatus },

		// Progress of individual step statuses
		// "paused" status progress
		pauseProgress: { type: Percentage, value: 1 },
		// "approved" status progress
		approvalProgress: { type: Percentage, value: function (_observe) {
			return _observe(this.dataForm._status);
		} },
		// "sentBack" status progress
		sendBackProgress: { type: Percentage, value: function (_observe) {
			return this.sendBackReason ? 1 : 0;
		} },

		// "redelegate" status progress
		redelegationProgress: { type: Percentage, value: function (_observe) {
			var total = 0, status = 0;
			total++;
			if (this.redelegationReason) status++;
			total++;
			if (this.redelegatedTo) status++;
			return status / total;
		} },

		// "rejected" status progress
		rejectionProgress: { type: Percentage, value: function (_observe) {
			return this.rejectionReason ? 1 : 0;
		} },

		// Use it to redelegate from this step to previousStep
		redelegate: {
			type: db.Function,
			value: function (targetStep) {
				this.redelegatedTo = targetStep;
				this.officialStatus = 'redelegated';
			}
		},

		// Computed processing step status. Resolves to final (not 'pending') status
		// only if all constraints are met, otherwise 'pending' status is resolved
		statusComputed: { type: ProcessingStepStatus, value: function () {
			// If not ready, then no status (yet)
			if (!this.isReady) return null;

			// If status not decided then clearly pending
			if (!this.officialStatus) return 'pending';

			if (this.officialStatus === 'approved') {
				return (this.approvalProgress === 1) ? 'approved' : 'pending';
			}

			if (this.officialStatus === 'sentBack') {
				return (this.sendBackProgress === 1) ? 'sentBack' : 'pending';
			}

			if (this.officialStatus === 'rejected') {
				return (this.rejectionProgress === 1) ? 'rejected' : 'pending';
			}

			if (this.officialStatus === 'redelegated') {
				return (this.redelegationProgress === 1) ? 'redelegated' : 'pending';
			}

			if (this.officialStatus === 'paused') {
				return (this.pauseProgress === 1) ? 'paused' : 'pending';
			}
			return 'pending';
		} },
		// In initial phase it's proxy of `statusComputed` result
		// However when final status is reached below getter is shadowed
		// with direct value (so any further model changes do not invalidate
		// once decided status).
		// `statusComputed` is kept separetely as we need access to computed
		// status also after final status is met (it's to gently handle eventual valid returns to step)
		status: { type: ProcessingStepStatus, value: function () {
			return this.statusComputed;
		} },

		// Convienient access getters:
		// Whether process is pending at step
		isPending: { value: function (_observe) { return this.status === 'pending'; } },
		// Whether process successfully passed this step
		isApproved: { value: function (_observe) { return this.status === 'approved'; } },
		// Whether process was sent back from this step
		isSentBack: { value: function (_observe) { return this.status === 'sentBack'; } },
		// Whether process was rejected at this step
		isRejected: { value: function (_observe) { return this.status === 'rejected'; } },
		// Whether process was redelegated from this step
		isRedelegated: { value: function (_observe) { return this.status === 'redelegated'; } },
		// Whether process is paused at step
		isPaused: { value: function (_observe) { return this.status === 'paused'; } },

		requirementUploads: { type: UploadsProcess, nested: true },
		paymentReceiptUploads: { type: UploadsProcess, nested: true },
		certificates: { type: MultipleProcess, nested: true },
		assignee: { type: User },
		isAssignable: { type: db.Boolean },
		processingTime: { type: UInteger, value: 0 },
		correctionTime: { type: UInteger, value: 0 }
	});

	ProcessingStep.prototype.requirementUploads.defineProperties({
		applicable: { type: RequirementUpload, multiple: true, value: function (_observe) {
			return _observe(this.master.requirementUploads._applicable);
		} },
		// Requirement uploads applicable for front desk verification
		frontDeskApplicable: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (requirementUpload) {
				if (_observe(requirementUpload._isFrontDeskApplicable)) {
					result.push(requirementUpload);
				}
			});
			return result;
		} },
		// Requirement uploads approved at front desk
		frontDeskApproved: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.frontDeskApplicable.forEach(function (requirementUpload) {
				if (_observe(requirementUpload._isFrontDeskApproved)) result.push(requirementUpload);
			});
			return result;
		} }
	});

	ProcessingStep.prototype.paymentReceiptUploads.defineProperties({
		applicable: { type: PaymentReceiptUpload, multiple: true, value: function (_observe) {
			return _observe(this.master.paymentReceiptUploads._applicable);
		} },
		uploaded: { type: PaymentReceiptUpload },
		approved: { type: PaymentReceiptUpload },
		rejected: { type: PaymentReceiptUpload },
		recentlyRejected: { type: PaymentReceiptUpload }
	});

	ProcessingStep.prototype.certificates.defineProperties({
		applicable: { type: Document, multiple: true, value: function (_observe) {
			// Property is observed on purpose
			// (there's a possible switch between direct and computed set mode)
			return _observe(this.master.certificates._applicable);
		} },
		uploaded: { type: Document, multiple: true, value: function (_observe) {
			return _observe(this.master.certificates.uploaded);
		} },
		released: { type: Document, multiple: true, value: function (_observe) {
			return _observe(this.master.certificates.released);
		} }
	});

	// Step which redelegated to this step
	ProcessingStep.prototype.define('redelegatedTo', {
		type: ProcessingStep
	});

	ProcessingStep.prototype.dataForm.setProperties({
		disabledMessage:
			_("Below form was already processed, and cannot be re-submitted at this point.")
	});

	// Fix type of Document.prototype.processingStep
	// See it's definition for explanation why it is done here
	db.Document.prototype.getOwnDescriptor('processingStep').type = ProcessingStep;

	return ProcessingStep;
}, { normalizer: require('memoizee/normalizers/get-1')() });
