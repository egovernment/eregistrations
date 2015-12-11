// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , definePercentage         = require('dbjs-ext/number/percentage')
  , _                        = require('mano').i18n.bind('Model')
  , defineProcessingStep     = require('../processing-step')
  , defineRequirementUploads = require('../business-process-new/requirement-uploads')
  , defineUserUploads        = require('../business-process-new/user-uploads')
  , defineProcessingSteps    = require('../business-process-new/processing-steps')
  , ensureDb                 = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	var Percentage = definePercentage(ensureDb(db));

	defineRequirementUploads(db);
	defineUserUploads(db);
	defineProcessingSteps(db);
	return defineProcessingStep(db).extend('RevisionProcessingStep', {
		label: { value: _("Revision") },

		// Progress for "approved" status
		// All applicable requirement uploads must be approved
		approvalProgress: { value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;
			if (_observe(this.master._isSubmittedLocked)) return 1;
			weight += itemWeight = _observe(this.master.requirementUploads.applicable).size;
			progress += _observe(this.master.requirementUploads._approvalProgress) * itemWeight;
			weight += itemWeight = _observe(this.master.paymentReceiptUploads.applicable).size;
			progress += _observe(this.master.paymentReceiptUploads._approvalProgress) * itemWeight;
			return weight ? (progress / weight) : 1;
		} },

		// Progress of revision
		// All applicable requirement uploads must be revised
		revisionProgress: { type: Percentage, value: function (_observe) {
			var weight = 0, progress = 0, itemWeight;
			weight += itemWeight = _observe(this.master.requirementUploads.applicable).size;
			progress += _observe(this.master.requirementUploads._revisionProgress) * itemWeight;
			weight += itemWeight = _observe(this.master.paymentReceiptUploads.applicable).size;
			progress += _observe(this.master.paymentReceiptUploads._revisionProgress) * itemWeight;
			return weight ? (progress / weight) : 1;
		} },

		// Progress for "sentBack" state
		// All applicable requirement uploads which are invalidated, must come with rejection reasoning
		sendBackProgress: { value: function (_observe) {
			return _observe(this.master.userUploads.applicable).some(function (reqUpload) {
				return _observe(reqUpload._isRecentlyRejected);
			}) ? 1 : 0;
		} },

		// Progress for "sentBack" status
		// All applicable requirement uploads which are invalidated, must come with rejection reasoning,
		// and invalid status must be explicitely state.
		// This needs to be complete for official to be able to send file back for corrections
		sendBackStatusesProgress: { value: function (_observe) {
			var total = 0, valid = 0;
			_observe(this.master.userUploads.applicable).forEach(function (reqUpload) {
				if (_observe(reqUpload._status) !== 'invalid') return;
				++total;
				if (_observe(reqUpload._isRejected)) ++valid;
			});
			if (!total) return 0;
			return valid / total;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
