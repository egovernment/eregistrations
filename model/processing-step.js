// Processing step class
// Describes the process of official role (like revision, processing or front desk)

'use strict';

var Map                   = require('es6-map')
  , memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineCreateEnum      = require('dbjs-ext/create-enum')
  , _                     = require('mano').i18n.bind('Model')
  , defineUser            = require('./user/base')
  , defineInstitution     = require('./institution')
  , defineFormSectionBase = require('./form-section-base');

module.exports = memoize(function (db) {
	var Percentage = definePercentage(db)
	  , StringLine = defineStringLine(db)
	  , Institution = defineInstitution(db)
	  , User = defineUser(db)
	  , FormSectionBase = defineFormSectionBase(db);

	defineCreateEnum(db);

	// Enum for processing step status
	var ProcessingStepStatus = StringLine.createEnum('ProcessingStepStatus', new Map([
		['paused', { label: _("Paused") }],
		['sentBack', { label: _("Sent back") }],
		['rejected', { label: _("Rejected") }],
		['approved', { label: _("Approved") }]
	]));

	return db.Object.extend('ProcessingStep', {
		// Label (name) of processing step
		label: { type: StringLine },
		// If step is processed by single institution
		// then instution should be exposed here
		institution: { type: Institution },
		// Official that processed request at given processing step
		processor: { type: User },

		// Whether given step applies at all
		isApplicable: { type: db.Boolean, value: true },
		// Whether business process is at given step or have passed it
		isReady: { type: db.Boolean, value: function (_observe) {
			return Boolean(_observe(this.master._isSubmitted) && this.isApplicable);
		} },
		// Processing step form fields section (applies only to approved status)
		dataForm: { type: FormSectionBase, nested: true },
		// Eventual reason of file been sent back
		sendBackReason: { type: db.String, required: true  },
		// Eventual reason of rejection
		rejectionReason: { type: db.String, required: true  },
		// Status of step
		status: { type: ProcessingStepStatus, required: true },

		// Progress of individual step statuses
		// "approved" status progress
		approvalProgress: { type: Percentage, value: function (_observe) {
			return _observe(this.dataForm._status);
		} },
		// "sentBack" status progress
		sendBackProgress: { type: Percentage, value: function (_observe) {
			return this.sendBackReason ? 1 : 0;
		} },
		// "rejected" status progress
		rejectionProgress: { type: Percentage, value: function (_observe) {
			return this.rejectionReason ? 1 : 0;
		} },

		// Whether process is pending at step
		isPending: { type: db.Boolean, value: function (_observe) {
			// If not ready, then obviously not pending
			if (!this.isReady) return false;
			// If status not decided then clearly pending
			if (!this.status) return true;
			// If approved, but form data is complete, it's still pending
			if (this.status === 'approved') return (this.approvalProgress !== 1);
			// If sent back, but no reason provided, it's still pending
			if (this.status === 'sentBack') return (this.sendBackProgress !== 1);
			// If rejected, but no reason provided, it's still pending
			if (this.status === 'rejected') return (this.rejectionProgress !== 1);
			// 'paused' is the only option left, that's not pending
			return false;
		} },

		// Whether process is paused at step
		isPaused: { type: db.Boolean, value: function (_observe) {
			// If not ready, then obviously not paused
			if (!this.isReady) return false;
			return (this.status === 'paused');
		} },

		// Whether process was sent back from this step
		isSentBack: { type: db.Boolean, value: function (_observe) {
			// If not ready, then obviously not sent back
			if (!this.isReady) return false;
			// No sentBack status, means no sent back
			if (this.status !== 'sentBack') return false;
			// Provided reason confirms complete sent back
			return this.sendBackProgress === 1;
		} },

		// Whether process was rejected at this step
		isRejected: { type: db.Boolean, value: function (_observe) {
			// If not ready, then obviously not rejected
			if (!this.isReady) return false;
			// No rejected status, means no it's not rejected
			if (this.status !== 'rejected') return false;
			// Provided reason confirms complete rejection
			return this.rejectionProgress === 1;
		} },

		// Whether process successfully passed this step
		isApproved: { type: db.Boolean, value: function (_observe) {
			// If not ready, then obviously not approved
			if (!this.isReady) return false;
			// No approved status, means no it's not approved
			if (this.status !== 'approved') return false;
			// Completed form confirms step completion
			return this.approvalProgress === 1;
		} },

		// Whether processing of this step has ended
		isClosed: { type: db.Boolean, value: function (_observe) {
			return this.isApproved || this.isRejected;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
