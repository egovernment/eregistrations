'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(validDb(db));

	return db.Object.extend('Institution', {
		name: { type: StringLine, required: true },
		abbr: { type: StringLine, required: true },
		address: { type: StringLine, required: true },
		toString: { value: function (options) {
			return this.name;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
