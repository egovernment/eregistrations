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
		// Cost's sideAmount is not taken into account in payable costs, nor in total.
		sideAmount: { type: Currency, step: 1 },
		// Whether cost have been paid
		isPaid: { type: db.Boolean, value: function () { return this.isPaidOnline; } },
		// Whether cost have been paid online (in Part A)
		isPaidOnline: { type: db.Boolean, value: function (_observe) {
			return _observe(this.owner.owner._isPaidOnline);
		} },
		// Whether payment was initialized online
		isOnlinePaymentInitialized: { type: db.Boolean, value: function (_observe) {
			return _observe(this.owner.owner._isOnlinePaymentInitialized);
		} },
		// Whether payment is made online
		// Common case is that cost can be paid both physically and online
		// In this scenario we mark it as electronic as soon as we detect
		// an online payment beeing initialized
		isElectronic: { type: db.Boolean, value: function () {
			return this.isPaidOnline || this.isOnlinePaymentInitialized;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
