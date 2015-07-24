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
		// Costs which are covered by the payment receipt
		costs: { type: Cost, multiple: true },
		applicableCosts: { type: Cost, multiple: true, value: function (_observe) {
			var result = [], payable = _observe(this.master.costs.payable);
			this.costs.forEach(function (cost) {
				if (!payable.has(cost)) return;
				if (_observe(cost._isPaidOnline)) return;
				result.push(cost);
			});
			return result;
		} }
	});

	return PaymentReceiptUpload;
}, { normalizer: require('memoizee/normalizers/get-1')() });

// Required here as it's circular reference
defineCost = require('./cost');
