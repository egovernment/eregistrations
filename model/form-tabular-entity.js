'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	StringLine = defineStringLine(db);
	return db.Object.extend('FormTabularEntity', {
		label: { type: StringLine },
		propertyName: { type: StringLine, required: true },
		desktopOnly: { type: db.Boolean, value: false },
		mobileOnly: { type: db.Boolean, value: false }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
