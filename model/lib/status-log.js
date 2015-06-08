'use strict';

var memoize          = require('memoizee/plain')
  , ensureDb         = require('dbjs/valid-dbjs')
  , defineUser       = require('./user/base')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(ensureDb(db))
	  , User       = defineUser(db);

	return db.Object.extend('StatusLog', {
		label: { type: StringLine, required: true },
		time: { type: db.DateTime, required: true },
		official: { type: User },
		text: { type: db.String, required: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
