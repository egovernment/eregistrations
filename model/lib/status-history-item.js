'use strict';

var memoize          = require('memoizee/plain')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineUser       = require('../user/base');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , User       = defineUser(db);

	return db.Object.extend('StatusHistoryItem', {
		status: { type: StringLine, required: true },
		processor: { type: User }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
