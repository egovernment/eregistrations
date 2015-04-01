'use strict';

var memoize          = require('memoizee/plain')
  , validDb = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine;
	validDb(db);
	if (!db.User) {
		throw new Error("StatusLog could not be setup, make sure User is defined.");
	}
	StringLine = defineStringLine(db);

	db.Object.extend('StatusLog', {
		label: { type: StringLine, required: true },
		time: { type: db.DateTime, required: true },
		official: { type: db.User },
		text: { type: db.String, required: true }
	});

	return db.StatusLog;
}, { normalizer: require('memoizee/normalizers/get-1')() });
