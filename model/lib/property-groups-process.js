// PropertyGroupsProcess model
// Allows cumulation certain subset of property groups (form sections)

'use strict';

var _                     = require('mano').i18n.bind('Model')
  , memoize               = require('memoizee/plain')
  , Map                   = require('es6-map')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineUInteger        = require('dbjs-ext/number/integer/u-integer')
  , defineStringLine      = require('dbjs-ext/string/string-line')
  , defineCreateEnum      = require('dbjs-ext/create-enum')
  , defineMultipleProcess = require('./multiple-process')
  , defineFormSectionBase = require('../form-section-base');

module.exports = memoize(function (db/*, options*/) {
	var Percentage      = definePercentage(db)
	  , UInteger        = defineUInteger(db)
	  , StringLine      = defineStringLine(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , FormSectionBase = defineFormSectionBase(db);

	defineCreateEnum(db);

	// Enum for forms status
	var PropertyGroupsStatus = StringLine.createEnum('PropertyGroupsStatus', new Map([
		['valid', { label: _("Valid") }],
		['invalid', { label: _("Invalid") }]
	]));

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
		// Verification status of process
		status: { type: PropertyGroupsStatus },
		// Eventual rejection details
		rejectReason: { type: db.String, required: true, label: _("Explanation") },
		// Whether process was rejected and reject reason was provided
		isRejected: { type: db.Boolean, value: function () {
			if (this.status == null) return false;
			if (this.status !== 'invalid') return false;
			return Boolean(this.rejectReason);
		} },

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
