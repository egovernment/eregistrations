'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , definePercentage = require('dbjs-ext/number/percentage');

module.exports = memoize(function (db) {
	var StringLine, Percentage;
	validDb(db);
	db.Object.defineProperties({
		getFormApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'FormApplicable';
		} },
		getApplicablePropName: { type: db.Function, value: function (prop) {
			return 'is' + prop[0].toUpperCase() + prop.slice(1) + 'Applicable';
		} }
	});

	StringLine = defineStringLine(db);
	Percentage = definePercentage(db);
	return db.Object.extend('FormSectionBase', {
		label: { type: StringLine, required: true },
		isApplicable: { type: db.Boolean, required: true, value: true },
		isDisabled: { type: db.Boolean, value: false },
		status: { type: Percentage, required: true, value: 1 },
		resolventValue: { type: db.Base },
		onIncompleteMessage: { type: StringLine }
	}, {
		excludedFromStatusIfFilled: { type: StringLine, multiple: true },
		actionUrl: { type: StringLine, required: true },
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
