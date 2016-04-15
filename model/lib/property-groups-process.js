// PropertyGroupsProcess model
// Allows cumulation certain subset of property groups (form sections)

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineUInteger        = require('dbjs-ext/number/integer/u-integer')
  , defineMultipleProcess = require('./multiple-process')
  , defineDataSnapshot    = require('./data-snapshot')
  , defineFormSectionBase = require('../form-section-base');

module.exports = memoize(function (db/*, options*/) {
	var Percentage      = definePercentage(db)
	  , UInteger        = defineUInteger(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , FormSectionBase = defineFormSectionBase(db)
	  , DataSnapshot    = defineDataSnapshot(db);

	var PropertyGroupsProcess = MultipleProcess.extend('PropertyGroupsProcess', {
		// Applicable form sections
		applicable: { type: FormSectionBase },
		// Cumulated progress of all applicable form sections
		progress: { type: Percentage, value: function (_observe) {
			var total = 0, valid = 0;
			this.applicable.forEach(function (section) {
				var weight = _observe(section._weight), status = _observe(section._status);
				if (!weight) {
					if (status !== 1) ++total;
					return;
				}
				valid += status * weight;
				total += weight;
			});
			if (!total) return 1;
			return valid / total;
		} },
		// Weight of property group (in other words: number of required properties)
		weight: { type: UInteger, value: function (_observe) {
			var weight = 0;
			this.applicable.forEach(function (section) { weight += _observe(section._weight); });
			return weight;
		} },

		// Forms data snapshots
		dataSnapshot: { type: DataSnapshot, nested: true },
		toJSON: { type: db.Function, value: function (ignore) {
			var result = [];
			this.applicable.forEach(function (section) {
				if (section.hasFilledPropertyNamesDeep) result.push(section.toJSON());
			});
			return result;
		} }
	});
	PropertyGroupsProcess.prototype.map._descriptorPrototype_.type = FormSectionBase;
	return PropertyGroupsProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
