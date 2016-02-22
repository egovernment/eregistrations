// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , definePercentage         = require('dbjs-ext/number/percentage')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Percentage = definePercentage(ensureDb(db));

	return defineProcessingStep(db).extend('RevisionProcessingStep', {
		label: { value: _("Revision") },

		// Whether the revision was successfull
		isRevisionPending: { type: db.Boolean, value: function (_observe) {
			// If the whole step is not pending, then obviously not pending
			if (!this.isPending) return false;

			return !(this.isRevisionApproved && this.revisionApprovalProgress === 1);
		} },

		isRevisionApproved: { type: db.Boolean, value: false },

		// Progress of revision approval
		// All applicable requirement uploads must be approved
		revisionApprovalProgress: { type: Percentage, value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;

			if (_observe(this.master._isSentBack)) return 1;
			weight += itemWeight = _observe(this.requirementUploads.applicable).size;
			progress += _observe(this.requirementUploads._approvalProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.applicable).size;
			progress += _observe(this.paymentReceiptUploads._approvalProgress) * itemWeight;

			return weight ? (progress / weight) : 1;
		} },

		// Progress for "approved" status
		// Defaults to revisionApprovalProgress
		approvalProgress: { value: function (_observe) {
			return this.revisionApprovalProgress;
		} },

		// Progress of revision
		// All applicable requirement uploads must be revised
		revisionProgress: { type: Percentage, value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;
			weight += itemWeight = _observe(this.requirementUploads.applicable).size;
			progress += _observe(this.requirementUploads._revisionProgress) * itemWeight;
			weight += itemWeight = _observe(this.paymentReceiptUploads.applicable).size;
			progress += _observe(this.paymentReceiptUploads._revisionProgress) * itemWeight;
			return weight ? (progress / weight) : 1;
		} },

		// Progress for "sentBack" state
		// All applicable requirement uploads which are invalidated, must come with rejection reasoning
		sendBackProgress: { value: function (_observe) {
			return this.applicableUploads.some(function (reqUpload) {
				return _observe(reqUpload._isRecentlyRejected);
			}) ? 1 : 0;
		} },

		// Progress for "sentBack" status
		// All applicable requirement uploads which are invalidated, must come with rejection reasoning,
		// and invalid status must be explicitely state.
		// This needs to be complete for official to be able to send file back for corrections
		sendBackStatusesProgress: { value: function (_observe) {
			var total = 0, valid = 0;
			this.applicableUploads.forEach(function (reqUpload) {
				if (_observe(reqUpload._status) !== 'invalid') return;
				++total;
				if (_observe(reqUpload._isRejected)) ++valid;
			});
			if (!total) return 0;
			return valid / total;
		} },

		// Cumulates applicable requirement uploads and payment receipt uploads.
		applicableUploads: {
			type: db.RequirementUpload,
			multiple: true,
			value: function (_observe) {
				var result = [];
				_observe(this.requirementUploads.applicable).forEach(function (upload) {
					result.push(upload);
				});
				_observe(this.paymentReceiptUploads.applicable).forEach(function (upload) {
					result.push(upload);
				});
				return result;
			}
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
