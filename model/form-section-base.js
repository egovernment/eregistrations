'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , StringLine;

module.exports = memoize(function (db) {
	validDb(db);
	StringLine = defineStringLine(db);
	return db.Object.extend('FormSectionBase', {
		label: { type: StringLine, required: true },
		isApplicable: { type: db.Boolean, required: true },
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
