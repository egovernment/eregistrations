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
		applicableByRequirements: { type: RequirementUpload,
			multiple: true,
			value: function (_observe) {
				var result = [];
				_observe(this.master.requirements.applicable).forEach(function (requirement) {
					_observe(requirement.uploads).forEach(function (requirementUpload) {
						result.push(requirementUpload);
					});
				});
				return result;
			} },
		// By default this returns applicableByRequirements.
		// It should be overriden if there are some extra requirementUploads not from requirements.
		applicable: { type: RequirementUpload, value: function (_observe) {
			return this.applicableByRequirements;
		} }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
