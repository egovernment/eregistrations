'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	return db.Object.extend('FormTabularEntity', {
		propertyName: { type: StringLine, required: true },
		desktopOnly: { type: db.Boolean, value: true },
		mobileOnly: { type: db.Boolean, value: false },
		label: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
