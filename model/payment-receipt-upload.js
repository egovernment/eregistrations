// PaymentRequirementUpload class

'use strict';

var memoize                 = require('memoizee/plain')
  , defineRequirementUpload = require('./requirement-upload')
  , defineCost;

module.exports = memoize(function (db) {
	var RequirementUpload = defineRequirementUpload(db)

	  , PaymentReceiptUpload = RequirementUpload.extend('PaymentReceiptUpload')
	  , Cost = db.Cost || defineCost(db);

	PaymentReceiptUpload.prototype.defineProperties({
		// Costs which are covered by payment receipt
		costs: { type: Cost, multiple: true, value: function (_observe) {
			var result = [];
			this.master.costs.payable.forEach(function (cost) {
				if (cost.paymentReceipt === this) result.push(cost);
			}, this);
			return result;
		} }
	});

	return PaymentReceiptUpload;
}, { normalizer: require('memoizee/normalizers/get-1')() });

// Required here as it's circular reference
defineCost = require('./cost');
