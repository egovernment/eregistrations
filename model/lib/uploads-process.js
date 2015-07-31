// UploadsProcess model
// Allows processing of map of requirement uploads

'use strict';

var memoize                 = require('memoizee/plain')
  , definePercentage        = require('dbjs-ext/number/percentage')
  , defineMultipleProcess   = require('./multiple-process')
  , defineRequirementUpload = require('../requirement-upload');

module.exports = memoize(function (db/*, options*/) {
	var Percentage        = definePercentage(db)
	  , MultipleProcess   = defineMultipleProcess(db)
	  , RequirementUpload = defineRequirementUpload(db);

	var UploadsProcess = MultipleProcess.extend('UploadsProcess', {
		// Applicable uploads
		applicable: { type: RequirementUpload },
		// Subset of applicable uploads for which document files were uploaded
		uploaded: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload.document.files.ordered._size)) result.push(upload);
			});
			return result;
		} },
		// Progress of uploads
		progress: { type: Percentage, value: function (_observe) {
			if (!this.applicable.size) return 1;
			return this.uploaded.size / this.applicable.size;
		} },

		// Subset of approved uploads
		approved: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload._isApproved)) result.push(upload);
			});
			return result;
		} },
		// Subset of rejected  uploads
		rejected: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (upload) {
				if (_observe(upload._isRejected)) result.push(upload);
			});
			return result;
		} },
		// Progress for "approved" status
		approvalProgress: { value: function (_observe) {
			if (!this.applicable.size) return 1;
			return this.approved.size / this.applicable.size;
		} },
		// Progress of revision
		revisionProgress: { value: function (_observe) {
			if (!this.applicable.size) return 1;
			return (this.approved.size + this.rejected.size) / this.applicable.size;
		} }
	});
	UploadsProcess.prototype.map._descriptorPrototype_.type = RequirementUpload;
	return UploadsProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
