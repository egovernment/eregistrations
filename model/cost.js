// Cost class

'use strict';

var memoize                    = require('memoizee/plain')
  , defineCurrency             = require('dbjs-ext/number/currency')
  , defineStringLine           = require('dbjs-ext/string/string-line')
  , definePaymentReceiptUpload;

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , Currency = defineCurrency(db)

	  , Cost = db.Object.extend('Cost')
	  , PaymentReceiptUpload = db.PaymentReceiptUpload || definePaymentReceiptUpload(db);

	Cost.prototype.defineProperties({
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
		// Eventual payment receipt upload
		paymentReceipt: { type: PaymentReceiptUpload, value: function () {
			if (!this.master.paymentReceiptUploads || this.isPaidOnline) return;
			return this.master.paymentReceiptUploads.map[this.key];
		} },
		// Whether payment is made online
		isElectronic: { type: db.Boolean, value: false }
	});

	return Cost;
}, { normalizer: require('memoizee/normalizers/get-1')() });

// Required here as it's circular reference
definePaymentReceiptUpload = require('./payment-receipt-upload');
