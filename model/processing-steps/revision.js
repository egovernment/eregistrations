// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , definePercentage         = require('dbjs-ext/number/percentage')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Percentage     = definePercentage(ensureDb(db))
	  , ProcessingStep = defineProcessingStep(db);

	var RevisionProcessingStep = ProcessingStep.extend('RevisionProcessingStep', {
		label: { value: _("Revision") },

		// Final revision status as decided by official
		revisionOfficialStatus: { type: db.ProcessingStepStatus, value: function () {
			return this.officialStatus;
		} },
		// Computed revision status. Resolves to final (not 'pending') status
		// only if all constraints are met
		revisionStatus: { type: db.ProcessingStepStatus, value: function () {
			if (this.revisionOfficialStatus === 'approved') {
				return (this.revisionApprovalProgress === 1) ? 'approved' : 'pending';
			}
			return this.status;
		} },

		// Whether step is pending at revision
		isRevisionPending: { type: db.Boolean, value: function () {
			return (this.revisionStatus === 'pending');
		} },

		// Whether step was approved at revision
		isRevisionApproved: { type: db.Boolean, value: function () {
			return (this.revisionStatus === 'approved');
		} },

		// Progress of revision approval
		// All processable requirement uploads must be approved
		revisionApprovalProgress: { type: Percentage, value: function (_observe) {
			var weight   = 1
			  , progress = _observe(this.dataFormsRevision._approvalProgress)
			  , itemWeight;

			weight += itemWeight = _observe(this.requirementUploads.processable).size;
			progress += _observe(this.requirementUploads._approvalProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.processable).size;
			progress += _observe(this.paymentReceiptUploads._approvalProgress) * itemWeight;

			return progress / weight;
		} },

		// Progress for "approved" status
		// Defaults to revisionApprovalProgress
		approvalProgress: { value: function (_observe) {
			return this.revisionApprovalProgress;
		} },

		// Progress of revision
		// All processable requirement uploads must be revised
		revisionProgress: { type: Percentage, value: function (_observe) {
			var weight   = 1
			  , progress = _observe(this.dataFormsRevision._progress)
			  , itemWeight;

			weight += itemWeight = _observe(this.requirementUploads.processable).size;
			progress += _observe(this.requirementUploads._revisionProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.processable).size;
			progress += _observe(this.paymentReceiptUploads._revisionProgress) * itemWeight;

			return progress / weight;
		} },

		// Progress for "sentBack" state
		// All processable requirement uploads which are invalidated, must come with rejection reasoning
		sendBackProgress: { value: function (_observe) {
			var isAnyRecentlyRejected = this.processableUploads.some(function (reqUpload) {
				return _observe(reqUpload._isRecentlyRejected);
			});

			return (isAnyRecentlyRejected || _observe(this.dataFormsRevision._sentBackProgress)) ? 1 : 0;
		} },

		// Progress for "sentBack" status
		// All processable requirement uploads which are invalidated, must come with rejection
		// reasoning, and invalid status must be explicitly state.
		// This needs to be complete for official to be able to send file back for corrections
		sendBackStatusesProgress: { value: function (_observe) {
			var weight = 0, progress = 0;

			this.processableUploads.forEach(function (reqUpload) {
				if (_observe(reqUpload._status) !== 'invalid') return;
				++weight;
				if (_observe(reqUpload._isRejected)) ++progress;
			});

			if (_observe(this.master.dataForms._isRejected)) {
				++weight;
				++progress;
			}

			return weight ? progress / weight : 0;
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
		},

		dataFormsRevision: {
			type: db.Object,
			nested: true
		}
	});

	RevisionProcessingStep.prototype.dataFormsRevision.defineProperties({
		// Whether this processing step is able to review data forms
		isProcessable: {
			type: db.Boolean,
			value: true
		},
		// Progress of data forms revision
		// The verification status must be set with additional rejection reason if rejected.
		progress: {
			type: Percentage,
			value: function (_observe) {
				if (!this.isProcessable) return 1;
				return _observe(this.master.dataForms._isApproved) ||
					_observe(this.master.dataForms._isRejected) ? 1 : 0;
			}
		},
		approvalProgress: {
			type: Percentage,
			value: function (_observe) {
				if (!this.isProcessable) return 1;
				return _observe(this.master.dataForms._isApproved) ? 1 : 0;
			}
		},
		sentBackProgress: {
			type: Percentage,
			value: function (_observe) {
				if (!this.isProcessable) return 1;
				return _observe(this.master.dataForms._isRejected) ? 1 : 0;
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
