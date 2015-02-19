// Document abstraction

'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	db.Object.extend('Document', {}, {
		label: { type: StringLine, required: true },
		legend: { type: StringLine, required: true },
		abbr: { type: StringLine, required: true }
	});

	return db.Document;
}, { normalizer: require('memoizee/normalizers/get-1')() });
