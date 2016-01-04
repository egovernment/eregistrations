// Guide related properties

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineFormSectionBase = require('../form-section-base')
  , defineBusinessProcess = require('./requirements');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , FormSectionBase = defineFormSectionBase(db)
	  , Percentage      = definePercentage(db);

	BusinessProcess.prototype.defineProperties({
		// Determinants form section
		determinants: { type: FormSectionBase, nested: true },

		// Guide fill progress status
		guideProgress: { type: Percentage, value: function (_observe) {
			var total = _observe(this.determinants._weight)
			  , valid = this.determinants.weight * _observe(this.determinants._status);
			++total;
			valid += _observe(this.registrations._guideProgress);
			++total;
			valid += _observe(this.requirements._guideProgress);
			return valid / total;
		} }
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
