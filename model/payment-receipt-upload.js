// PaymentRequirementUpload class

'use strict';

var Map                     = require('es6-map')
  , memoize                 = require('memoizee/plain')
  , defineStringLine        = require('dbjs-ext/string/string-line')
  , defineCreateEnum        = require('dbjs-ext/create-enum')
  , _                       = require('mano').i18n.bind('Model')
  , defineRequirementUpload = require('./requirement-upload')
  , defineCost              = require('./cost')
  , defineCurrency          = require('dbjs-ext/number/currency');

module.exports = memoize(function (db) {
	var StringLine        = defineStringLine(db)
	  , RequirementUpload = db.RequirementUpload || defineRequirementUpload(db)
	  , Cost              = defineCost(db)
	  , Currency          = defineCurrency(db);

	defineCreateEnum(db);

	// Enum for document upload status
	var PaymentReceiptUploadStatus = StringLine.createEnum('PaymentReceiptUploadStatus', new Map([
		['valid', { label: _("Confirmed as paid") }],
		['invalid', { label: _("Rejected") }]
	]));

	return RequirementUpload.extend('PaymentReceiptUpload', {
		// Costs which are covered by the payment receipt
		costs: { type: Cost, multiple: true },
		// Total amount of this payment receipt applicable costs
		totalAmount: { type: Currency, value: function (_observe) {
			var result = 0;

			this.applicableCosts.forEach(function (cost) {
				result += _observe(cost._amount);
			});

			return result;
		} },
		applicableCosts: { type: Cost, multiple: true, value: function (_observe) {
			var result = [], payable = _observe(this.master.costs.payable);
			this.costs.forEach(function (cost) {
				if (!payable.has(cost)) return;
				result.push(cost);
			});
			return result;
		} },
		// Applicable costs that are not paid online
		applicableCostsForUserUpload: { type: Cost, multiple: true, value: function (_observe) {
			var result = [];
			this.applicableCosts.forEach(function (cost) {
				if (_observe(cost._isOnlinePaymentInitialized)) return;
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
		} },

		// Whether document upload was rejected recently
		// Needed for part A, where status for document might already have been cleared
		// due to changes made to uploads, but we still need to show rejection info
		isRecentlyRejected: { type: db.Boolean, value: function () {
			if ((this.status !== 'invalid') && (this.status != null)) return false;
			return Boolean(this.rejectReasonMemo);
		} },
		toJSON: { value: function (ignore) {
			var data = this.database.RequirementUpload.prototype.toJSON.call(this);
			data.uniqueKey = this.key;
			delete data.issuedBy;
		} },
		// Enrich snapshot JSON with reactive configuration of revision related properties
		enrichJSON: { value: function (data) {
			if (data.isFinalized) return;
			data.status = this._isApproved.map(function (isApproved) {
				if (isApproved) return 'approved';
				return this._isRejected.map(function (isRejected) {
					if (isRejected) return 'rejected';
				});
			}.bind(this));
			data.statusLog = this.document.statusLog.ordered.toArray();
			data.rejectReasons = [this._rejectReasonMemo];
		} },
		// Finalize snapshot JSON by adding revision status properties
		finalizeJSON: { type: db.Function, value: function (data) {
			var statusLog;
			if (data.isFinalized) return;
			if (this.isApproved) data.status = 'approved';
			else if (this.isRejected) data.status = 'rejected';
			statusLog = [];
			this.document.statusLog.ordered.forEach(function (log) {
				statusLog.push({
					label: log.getOwnDescriptor('label').valueToJSON(),
					time: log.getOwnDescriptor('time').valueToJSON(),
					text: log.getOwnDescriptor('text').valueToJSON()
				});
			});
			if (statusLog.length) data.statusLog = statusLog;
			if (data.status === 'rejected') {
				data.rejectReasons = [this.getOwnDescriptor('rejectReasonMemo').valueToJSON()];
			}
			data.isFinalized = true;
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
