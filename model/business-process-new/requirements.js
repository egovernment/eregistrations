// BusinessProcess requirements resolution

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineRequirement     = require('../requirement')
  , defineBusinessProcess = require('./certificates');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , Percentage      = definePercentage(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , Requirement     = defineRequirement(db);

	BusinessProcess.prototype.defineProperties({
		requirements: { type: MultipleProcess, nested: true }
	});

	BusinessProcess.prototype.requirements.map._descriptorPrototype_.type = Requirement;
	BusinessProcess.prototype.requirements.defineProperties({
		// Resolved requirements out of requested registrations
		resolved: { type: Requirement, multiple: true, value: function (_observe) {
			var resolved = {}, certificates = _observe(this.master.certificates.applicable), result = []
			  , key;
			_observe(this.master.registrations.requested).forEach(function (registration) {
				_observe(registration.requirements).forEach(function (requirement) {
					if (certificates.some(function (cert) { return (cert.key === requirement.key); })) {
						// Given requirement is also a requested certificate,
						// therefore do not require it from user
						return;
					}
					resolved[requirement.key] = true;
				});
			});
			// Assure expected order of result set
			if (this.master.requirements.map.forEach) {
				this.master.requirements.map.forEach(function (value, key) {
					if (resolved.hasOwnProperty(key)) result.push(value);
				});
			} else {
				// There's no forEach on this.requirements map in legacy browsers mock
				for (key in this.master.requirements.map) {
					if (resolved.hasOwnProperty(key)) result.push(this.master.requirements.map[key]);
				}
			}
			return result;
		} },
		// Applicable out of resolved requirments set
		// Usually matches all resolved, but may address corner cases like:
		// "If both utilityBill and electricityBiil resolve from registrations, please
		// apply only electricityBill"
		applicable: { type: Requirement, value: function (_observe) {
			var result = [];
			this.resolved.forEach(function (requirement) {
				var isApplicable = requirement._get
					? _observe(requirement._isApplicable) : requirement.isApplicable;
				if (isApplicable) result.push(requirement);
			});
			return result;
		} },
		// Some requirements may require from user to fill some form fields
		// at guide steps (e.g. user may be forced to choose which documents he prefer to upload)
		// In such case below property indicates that all questions were answered by user.
		// It's one of the sub calculations that are needed to calcualate guide progress
		guideProgress: { type: Percentage, value: function (_observe) {
			var total = 0, valid = 0;
			this.applicable.forEach(function (requirement) {
				++total;
				valid += _observe(requirement._guideProgress);
			});
			if (!total) return 1;
			return valid / total;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
