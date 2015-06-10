// BusinessProcess requirement uploads resolution

'use strict';

var memoize                 = require('memoizee/plain')
  , definePercentage        = require('dbjs-ext/number/percentage')
  , defineMultipleProcess   = require('../lib/multiple-process')
  , defineRequirementUpload = require('../requirement-upload')
  , defineRegistrations     = require('./registrations');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineRegistrations(db, arguments[1])
	  , Percentage = definePercentage(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , RequirementUpload = defineRequirementUpload(db);

	BusinessProcess.prototype.defineProperties({
		requirementUploads: { type: MultipleProcess, nested: true }
	});
	BusinessProcess.prototype.requirementUploads.map._descriptorPrototype_.type = RequirementUpload;
	BusinessProcess.prototype.requirementUploads.defineProperties({
		// Applicable requirement uploads resolved out of applicable requirements
		applicable: { type: RequirementUpload, value: function (_observe) {
			var result = [];
			_observe(this.master.requirements.applicable).forEach(function (requirement) {
				_observe(requirement.requirementUploads).forEach(function (requirementUpload) {
					result.push(requirementUpload);
				});
			});
			return result;
		} },
		// Subset of applicable requirement uploads for which document files were uploaded
		uploaded: { type: RequirementUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (requirementUpload) {
				if (_observe(requirementUpload.document.orderedFiles._size)) result.push(requirementUpload);
			});
			return result;
		} },
		// Progress of requirement uploads
		progress: { type: Percentage, value: function (_observe) {
			return this.uploaded.size / this.applicable.size;
		} }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
