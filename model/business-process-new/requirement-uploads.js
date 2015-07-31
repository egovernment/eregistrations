// BusinessProcess requirement uploads resolution

'use strict';

var memoize                 = require('memoizee/plain')
  , defineUploadsProcess    = require('../lib/uploads-process')
  , defineRequirementUpload = require('../requirement-upload')
  , defineRequirements      = require('./requirements');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineRequirements(db, arguments[1])
	  , UploadsProcess = defineUploadsProcess(db)
	  , RequirementUpload = defineRequirementUpload(db);

	BusinessProcess.prototype.defineProperties({
		requirementUploads: { type: UploadsProcess, nested: true }
	});
	BusinessProcess.prototype.requirementUploads.defineProperties({
		// Applicable requirement uploads resolved out of applicable requirements
		applicable: { type: RequirementUpload, value: function (_observe) {
			var result = [];
			_observe(this.master.requirements.applicable).forEach(function (requirement) {
				_observe(requirement.uploads).forEach(function (requirementUpload) {
					result.push(requirementUpload);
				});
			});
			return result;
		} },
		// Requirement uploads applicable for front desk verification
		frontDeskApplicable: { type: RequirementUpload, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (requirementUpload) {
				if (requirementUpload.validateWithOriginal) result.push(requirementUpload);
			});
			return result;
		} },
		// Requirement uploads approved at front desk
		frontDeskApproved: { type: RequirementUpload, value: function (_observe) {
			var result = [];
			this.frontDeskApproved.forEach(function (requirementUpload) {
				if (_observe(requirementUpload._matchesOriginal)) result.push(requirementUpload);
			});
			return result;
		} }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
