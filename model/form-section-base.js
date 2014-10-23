'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	return db.Object.extend('FormSectionBase', {
		isApplicable: { type: db.Boolean, required: true, value: true },
		resolventProperty: { type: StringLine },
		resolventValue: { type: db.Base },
		statusResolventProperty: { type: StringLine, required: true }
	}, {
		actionUrl: { type: StringLine, required: true },
		label: { type: StringLine, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
