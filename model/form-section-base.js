'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineUInteger   = require('dbjs-ext/number/integer/u-integer')
  , definePercentage = require('dbjs-ext/number/percentage')
  , defineDate       = require('dbjs-ext/date-time/date');

module.exports = memoize(function (db) {
	var StringLine, Percentage, UInteger, DateType;
	validDb(db);
	db.Object.defineProperties({
		getFormApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'FormApplicable';
		} },
		getApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'Applicable';
		} }
	});
	UInteger   = defineUInteger(db);
	StringLine = defineStringLine(db);
	Percentage = definePercentage(db);
	DateType   = defineDate(db);
	return db.Object.extend('FormSectionBase', {
		label: { type: StringLine, required: true },
		isApplicable: { type: db.Boolean, required: true, value: true },
		status: { type: Percentage, required: true, value: 1 },
		weight: { type: UInteger, required: true },
		resolventValue: { type: db.Base },
		onIncompleteMessage: { type: StringLine },
		isUnresolved: { type: db.Boolean, value: function (_observe) {
			var resolved;
			if (!this.constructor.resolventProperty) return false;
			resolved = this.master.resolveSKeyPath(this.constructor.resolventProperty, _observe);
			return _observe(resolved.observable) !== this.resolventValue;
		} },
		isPropertyExcludedFromStatus: { type: db.Function, value: function (resolved, _observe) {
			if (!resolved.descriptor.required) return true;
			if (this.constructor.excludedFromStatusIfFilled.has(resolved.key) ||
					(!resolved.descriptor.multiple &&
					Object.getPrototypeOf(resolved.object).get(resolved.key) != null)) {
				if (resolved.descriptor.multiple) {
					if (_observe(resolved.observable).size) return true;
				} else {
					if (_observe(resolved.observable) != null) return true;
				}
			}

			return false;
		} },
		lastEditDate: { type: DateType }
	}, {
		excludedFromStatusIfFilled: { type: StringLine, multiple: true },
		actionUrl: { type: StringLine, required: true },
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
