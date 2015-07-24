// PaymentRequirementUpload class

'use strict';

var memoize                 = require('memoizee/plain')
  , defineRequirementUpload = require('./requirement-upload')
  , defineCost              = require('./cost');

module.exports = memoize(function (db) {
	var RequirementUpload = defineRequirementUpload(db)
	  , Cost = defineCost(db);

	return RequirementUpload.extend('PaymentReceiptUpload', {
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
}, { normalizer: require('memoizee/normalizers/get-1')() });
