'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , definePercentage = require('dbjs-ext/number/percentage');

module.exports = memoize(function (db) {
	var StringLine, Percentage;
	validDb(db);
	StringLine = defineStringLine(db);
	Percentage = definePercentage(db);
	return db.Object.extend('FormSectionBase', {
		isApplicable: { type: db.Boolean, required: true, value: true },
		status: { type: Percentage, required: true, value: 1 }
	}, {
		actionUrl: { type: StringLine, required: true },
		label: { type: StringLine, required: true },
		resolventProperty: { type: StringLine },
		resolventValue: { type: db.Base }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
