// PaymentRequirementUpload class

'use strict';

var Map                     = require('es6-map')
  , memoize                 = require('memoizee/plain')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , defineCreateEnum        = require('dbjs-ext/create-enum')
  , _                       = require('mano').i18n.bind('Model')
  , defineRequirementUpload = require('./requirement-upload')
  , defineCost              = require('./cost');

module.exports = memoize(function (db) {
	var StringLine = defineStringLine(db)
	  , RequirementUpload = defineRequirementUpload(db)
	  , Cost = defineCost(db);

	defineCreateEnum(db);

	// Enum for document upload status
	var PaymentReceiptUploadStatus = StringLine.createEnum('PaymentReceiptUploadStatus', new Map([
		['valid', { label: _("Confirmed as paid") }],
		['invalid', { label: _("Rejected") }]
	]));

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
		} },

		status: { type: PaymentReceiptUploadStatus },

		// In case of receipt upload we do not show all reject reasons just memo
		isRejected: { type: db.Boolean, value: function () {
			if (this.status == null) return false;
			if (this.status !== 'invalid') return false;
			return Boolean(this.rejectReasonMemo);
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
