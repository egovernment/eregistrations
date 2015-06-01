/**
	* Base class for all sections.
	*/

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
		// When isApplicable !== true the section will not be visible in the view
		// (rendered with default generator)
		isApplicable: { type: db.Boolean, required: true, value: true },
		// A percentage of completion of fields covered by the section
		status: { type: Percentage, required: true, value: 1 },
		// The weight of the section status. It is used to determine weighed status across sections.
		// It is usually equal to number of fields covered by the section.
		weight: { type: UInteger, required: true },
		// The value upon which constructor.resolventProperty is resolved.
		// Section is visible when section.master[section.resolventProperty] === section.resolventValue
		// See also resolventProperty.
		resolventValue: { type: db.Base },
		// Used to overwrite default message which is shown through view/components/incomplete-form-nav.
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
		// A multiple for which you can pass names of the properties you want excluded from
		// status calculation if they were already provided for the form (for example from guide).
		excludedFromStatusIfFilled: { type: StringLine, multiple: true },
		// The url to which the the form created around the section will be submitted.
		actionUrl: { type: StringLine, required: true },
		// Used to hide and show section depending on a value of certain property.
		// Set name of the property as value of resolventProperty.
		// Section is visible when section.master[section.resolventProperty] === section.resolventValue
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
