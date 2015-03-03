'use strict';

var memoize          = require('memoizee/plain')
  , validDb          = require('dbjs/valid-dbjs')
  , defineCurrency   = require('dbjs-ext/number/currency')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine, Currency;
	validDb(db);
	StringLine = defineStringLine(db);
	Currency   = defineCurrency(db);
	db.Object.extend('Cost', {
		amount: { type:  Currency },
		label: { type: StringLine },
		step: { value: 1 }
	});

	return db.Cost;
}, { normalizer: require('memoizee/normalizers/get-1')() });
