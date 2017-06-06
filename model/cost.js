// Cost class

'use strict';

var memoize           = require('memoizee/plain')
  , defineCurrency    = require('dbjs-ext/number/currency')
  , defineStringLine  = require('dbjs-ext/string/string-line')
  , defineInstitution = require('./institution');

module.exports = memoize(function (db) {
	var StringLine  = defineStringLine(db)
	  , Currency    = defineCurrency(db)
	  , Institution = defineInstitution(db)
	  , Cost        = db.Object.extend('Cost', {
		// Cost label
		label: { type: StringLine },
		// Cost legend
		legend: { type: StringLine },
		// Cost optional info
		optionalInfo: { type: db.String },
		// Cost amount
		amount: { type: Currency, step: 1 },
		// Cost's sideAmount is not taken into account in payable costs, nor in total.
		sideAmount: { type: Currency, step: 1 },
		// The institution that should receive the payment.
		institution: { type: Institution },
		// Whether cost have been paid
		isPaid: { type: db.Boolean, value: function () { return this.isPaidOnline; } },
		// Whether cost have been paid online (in Part A)
		isPaidOnline: { type: db.Boolean, value: function (_observe) {
			return _observe(this.owner.owner._isPaidOnline);
		} },
		isOnlinePaymentInitialized: { type: db.Boolean, value: function (_observe) {
			return this.isPaidOnline || this.isOnlinePaymentInProgress;
		} },
		// Whether payment was initialized online
		isOnlinePaymentInProgress: { type: db.Boolean, value: function (_observe) {
			return _observe(this.owner.owner._isOnlinePaymentInProgress);
		} },
		// Whether payment is made online
		// Common case is that cost can be paid both physically and online
		// In this scenario we mark it as electronic as soon as we detect
		// an online payment being initialized
		isElectronic: { type: db.Boolean, value: function () {
			return this.isOnlinePaymentInitialized;
		} },
		toWebServiceJSON: {
			value: function (ignore) {
				return {
					code: this.key,
					data: {
						amount: this.amount
					}
				};
			}
		}
	});

	Cost.prototype.defineProperties({

		toWSSchema: {
			value: function (ignore) {
				if (typeof process === 'undefined') return;
				return {
					type: "array",
					items: {
						type: "object",
						properties: {
							code: {
								type: "enum",
								ref: "costs"
							},
							amount: {
								type: "number"
							}
						}
					}
				};
			}
		}
	});
	return Cost;
}, { normalizer: require('memoizee/normalizers/get-1')() });
