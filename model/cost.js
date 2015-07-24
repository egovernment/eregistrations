// Cost class

'use strict';

var memoize          = require('memoizee/plain')
  , defineCurrency   = require('dbjs-ext/number/currency')
  , defineStringLine = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Currency = defineCurrency(db);

	return db.Object.extend('Cost', {
		// Cost label
		label: { type: StringLine },
		// Cost label
		legend: { type: StringLine },
		// Cost amount
		amount: { type: Currency, step: 1 },
		// Whether cost have been paid
		isPaid: { type: db.Boolean, value: function () { return this.isPaidOnline; } },
		// Whether cost have been paid online (in Part A)
		isPaidOnline: { type: db.Boolean, value: false },
		// Whether payment is made online
		isElectronic: { type: db.Boolean, value: false }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
