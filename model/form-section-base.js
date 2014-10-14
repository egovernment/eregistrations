'use strict';

var memoize    = require('memoizee/plain')
  , validDb    = require('dbjs/valid-dbjs')
  , StringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	validDb(db);
	StringLine = StringLine(db); //jslint: ignore
	return db.Object.extend('FormSectionBase', {
		label: { type: StringLine },
		isApplicable: { type: db.Boolean, value: function () {
			return true;
		} },
		resolventProperty: { type: StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
