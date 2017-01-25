'use strict';

var memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db);

	return db.Object.extend('StatusHistoryItem', {
		status: { type: StringLine, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
