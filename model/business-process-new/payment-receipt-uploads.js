// BusinessProcess payment receipt uploads resolution

'use strict';

var memoize                    = require('memoizee/plain')
  , defineUploadsProcess       = require('../lib/uploads-process')
  , definePaymentReceiptUpload = require('../payment-receipt-upload')
  , defineBusinessProcess      = require('./base')

  , defineCosts;

module.exports = memoize(function (db/* options */) {
	var options              = Object(arguments[1])
	  , BusinessProcess      = defineBusinessProcess(db, options)
	  , UploadsProcess       = defineUploadsProcess(db)
	  , PaymentReceiptUpload = definePaymentReceiptUpload(db);

	BusinessProcess.prototype.defineProperties({
		paymentReceiptUploads: { type: UploadsProcess, nested: true }
	});
	BusinessProcess.prototype.paymentReceiptUploads.map._descriptorPrototype_.type
		= PaymentReceiptUpload;
	BusinessProcess.prototype.paymentReceiptUploads.defineProperties({
		// Applicable payment receipt uploads
		applicable: { type: PaymentReceiptUpload, value: function (_observe) {
			var result = [];
			this.map.forEach(function (paymentReceiptUpload) {
				if (_observe(paymentReceiptUpload.applicableCosts._size)) result.push(paymentReceiptUpload);
			});
			return result;
		} },
		// Payment receipt uploads that should be uploaded
		uploadable: { type: PaymentReceiptUpload, multiple: true, value: function (_observe) {
			var result = [];
			this.map.forEach(function (paymentReceiptUpload) {
				if (_observe(paymentReceiptUpload.applicableCostsForUserUpload._size)) {
					result.push(paymentReceiptUpload);
				}
			});
			return result;
		} },
		progress: {
			value: function (_observe) {
				var totalProgress = 0;
				if (!this.weight) return 1;
				this.uploaded.forEach(function (paymentReceipt) {
					totalProgress += _observe(paymentReceipt._progress);
				});

				return totalProgress / this.weight;
			}
		},
		weight: {
			value: function (_observe) {
				return _observe(this.uploadable._size);
			}
		},

		uploaded: {
			type: PaymentReceiptUpload,
			value: function (_observe) {
				var result = [];
				this.uploadable.forEach(function (upload) {
					if (_observe(upload.document.files.ordered._size)) result.push(upload);
				});
				return result;
			}
		},
		approved: { type: PaymentReceiptUpload },
		rejected: { type: PaymentReceiptUpload }
	});

	if (!BusinessProcess.prototype.costs) defineCosts(db, options);

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });

defineCosts = require('./costs');
