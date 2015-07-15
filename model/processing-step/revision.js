// Revision processing step configuration

'use strict';

var memoize                  = require('memoizee/plain')
  , defineProcessingStep     = require('../processing-step')
  , defineRequirementUploads = require('../business-process-new/requirement-uploads')
  , defineProcessingSteps    = require('../business-process-new/processing-steps');

module.exports = memoize(function (db) {
	defineRequirementUploads(db);
	defineProcessingSteps(db);
	return defineProcessingStep(db).extend('RevisionProcessingStep', {

		// Progress for "approved" status
		// All applicable requirement uploads must be approved
		approvalProgress: { value: function (_observe) {
			var applicableSize = _observe(this.master.requirementUploads.applicable._size);
			if (!applicableSize) return 1;
			return _observe(this.master.requirementUploads.approved._size) / applicableSize;
		} },

		// Progress for "sentBack" status
		// All applicable requirement uploads which are invalidated, must come with rejection reasoning
		sendBackProgress: { value: function (_observe) {
			var total = 0, valid = 0;
			_observe(this.master.requirementUploads.applicable).forEach(function (reqUpload) {
				if (_observe(reqUpload._status) !== 'invalid') return;
				++total;
				if (_observe(reqUpload._isRejected)) ++valid;
			});
			if (!total) return 0;
			return valid / total;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
