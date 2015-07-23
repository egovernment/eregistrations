// BusinessProcess payment receipt uploads resolution

'use strict';

var memoize                    = require('memoizee/plain')
  , defineUploadsProcess       = require('../lib/uploads-process')
  , definePaymentReceiptUpload = require('../payment-receipt-upload')
  , defineBusinessProcess      = require('./base')

  , defineCosts;

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1])
	  , UploadsProcess = defineUploadsProcess(db)
	  , PaymentReceiptUpload = definePaymentReceiptUpload(db);

	BusinessProcess.prototype.defineProperties({
		paymentReceiptUploads: { type: UploadsProcess, nested: true }
	});
	BusinessProcess.prototype.paymentReceiptUploads.map._descriptorPrototype_.type
		= PaymentReceiptUpload;
	BusinessProcess.prototype.paymentReceiptUploads.defineProperties({
		// Applicable payment receipt uploads resolved out of payable costs
		applicable: { type: PaymentReceiptUpload, value: function (_observe) {
			var result = [];
			_observe(this.master.costs.payable).forEach(function (cost) {
				if (cost.paymentReceipt) result.push(_observe(cost._paymentReceipt));
			});
			return result;
		} },

		uploaded: { type: PaymentReceiptUpload },
		approved: { type: PaymentReceiptUpload },
		rejected: { type: PaymentReceiptUpload }
	});

	if (!BusinessProcess.prototype.costs) defineCosts(db);
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });

defineCosts = require('./costs');
