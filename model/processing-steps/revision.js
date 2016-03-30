// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , definePercentage         = require('dbjs-ext/number/percentage')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Percentage = definePercentage(ensureDb(db));

	var RevisionProcessingStep = defineProcessingStep(db).extend('RevisionProcessingStep', {
		label: { value: _("Revision") },

		// Whether the revision was successful
		isRevisionPending: { type: db.Boolean, value: function (_observe) {
			// If the whole step is not pending, then obviously not pending
			if (!this.isPending) return false;

			return !(this.isRevisionApproved && this.revisionApprovalProgress === 1);
		} },

		isRevisionApproved: { type: db.Boolean, value: false },

		// Progress of revision approval
		// All processable requirement uploads must be approved
		revisionApprovalProgress: { type: Percentage, value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;

			if (_observe(this.master._isSentBack)) return 1;
			weight += itemWeight = _observe(this.requirementUploads.processable).size;
			progress += _observe(this.requirementUploads._approvalProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.processable).size;
			progress += _observe(this.paymentReceiptUploads._approvalProgress) * itemWeight;

			return weight ? (progress / weight) : 1;
		} },

		// Progress for "approved" status
		// Defaults to revisionApprovalProgress
		approvalProgress: { value: function (_observe) {
			return this.revisionApprovalProgress;
		} },

		// Progress of revision
		// All processable requirement uploads must be revised
		revisionProgress: { type: Percentage, value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;
			weight += itemWeight = _observe(this.requirementUploads.processable).size;
			progress += _observe(this.requirementUploads._revisionProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.processable).size;
			progress += _observe(this.paymentReceiptUploads._revisionProgress) * itemWeight;
			return weight ? (progress / weight) : 1;
		} },

		// Progress for "sentBack" state
		// All processable requirement uploads which are invalidated, must come with rejection reasoning
		sendBackProgress: { value: function (_observe) {
			return this.processableUploads.some(function (reqUpload) {
				return _observe(reqUpload._isRecentlyRejected);
			}) ? 1 : 0;
		} },

		// Progress for "sentBack" status
		// All processable requirement uploads which are invalidated, must come with rejection
		// reasoning, and invalid status must be explicitly state.
		// This needs to be complete for official to be able to send file back for corrections
		sendBackStatusesProgress: { value: function (_observe) {
			var total = 0, valid = 0;
			this.processableUploads.forEach(function (reqUpload) {
				if (_observe(reqUpload._status) !== 'invalid') return;
				++total;
				if (_observe(reqUpload._isRejected)) ++valid;
			});
			if (!total) return 0;
			return valid / total;
		} },

		// Cumulates processable requirement uploads and payment receipt uploads.
		processableUploads: {
			type: db.RequirementUpload,
			multiple: true,
			value: function (_observe) {
				var result = [];
				_observe(this.requirementUploads.processable).forEach(function (upload) {
					result.push(upload);
				});
				_observe(this.paymentReceiptUploads.processable).forEach(function (upload) {
					result.push(upload);
				});
				return result;
			}
		}
	});

	RevisionProcessingStep.prototype.requirementUploads.defineProperties({
		// Uploads that should be processed by this processing step (applicable for processing).
		// Defaults to applicable requirement uploads.
		processable: { type: db.RequirementUpload, multiple: true, value: function (_observe) {
			return this.applicable;
		} }
	});

	RevisionProcessingStep.prototype.paymentReceiptUploads.defineProperties({
		// Payment receipt uploads that should be processed by this processing step (applicable for
		// processing). Defaults to applicable payment receipt uploads.
		processable: { type: db.PaymentReceiptUpload, multiple: true, value: function (_observe) {
			return this.applicable;
		} }
	});

	// Adapt approvalProgress and revisionProgress (from UploadsProcess) to use 'processable'
	// collection instead of applicable.
	['requirementUploads', 'paymentReceiptUploads'].forEach(function (uploadsProcess) {
		RevisionProcessingStep.prototype[uploadsProcess].setProperties({
			// Subset of approved uploads
			approved: function (_observe) {
				var result = [];
				this.processable.forEach(function (upload) {
					if (_observe(upload._isApproved)) result.push(upload);
				});
				return result;
			},
			// Subset of rejected  uploads
			rejected: function (_observe) {
				var result = [];
				this.processable.forEach(function (upload) {
					if (_observe(upload._isRejected)) result.push(upload);
				});
				return result;
			},
			// Progress for "approved" status
			approvalProgress: function (_observe) {
				if (!this.processable.size) return 1;
				return this.approved.size / this.processable.size;
			},
			// Progress of revision
			revisionProgress: function (_observe) {
				if (!this.processable.size) return 1;
				return (this.approved.size + this.rejected.size) / this.processable.size;
			}
		});
	});

	return RevisionProcessingStep;
}, { normalizer: require('memoizee/normalizers/get-1')() });
