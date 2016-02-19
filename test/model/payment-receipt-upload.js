'use strict';

var aFrom            = require('es5-ext/array/from')
  , Database         = require('dbjs')
  , defineUploads    = require('../../model/business-process-new/payment-receipt-uploads')
  , defineCosts      = require('../../model/business-process-new/costs')
  , defineMapUploads
	= require('../../model/business-process-new/utils/define-payment-receipt-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineUploads(db)

	  , businessProcess, paymentReceiptUpload;

	defineCosts(db);

	BusinessProcess.prototype.costs.map.defineProperties({
		test: { nested: true },
		test2: { nested: true },
		test3: { nested: true },
		test4: { nested: true }
	});
	BusinessProcess.prototype.costs.map.test.amount = 10;
	BusinessProcess.prototype.costs.map.test2.amount = 20;
	BusinessProcess.prototype.costs.map.test3.amount = 40;

	defineMapUploads(BusinessProcess, { test: { label: "Cost label", legend: "Cost legend", costs: [
		BusinessProcess.prototype.costs.map.test,
		BusinessProcess.prototype.costs.map.test3,
		BusinessProcess.prototype.costs.map.test4
	] } });

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.costs = function () {
		var costs = this.master.costs.map;
		return [costs.test, costs.test2, costs.test3, costs.test4];
	};
	businessProcess = new BusinessProcess();
	paymentReceiptUpload = businessProcess.paymentReceiptUploads.map.test;

	a.h1("Regular");
	a.deep(aFrom(businessProcess.costs.payable),
		[businessProcess.costs.map.test, businessProcess.costs.map.test2,
			businessProcess.costs.map.test3]);
	a.deep(aFrom(paymentReceiptUpload.costs), [businessProcess.costs.map.test,
		businessProcess.costs.map.test3, businessProcess.costs.map.test4]);
	a.deep(aFrom(paymentReceiptUpload.applicableCosts),
		[businessProcess.costs.map.test, businessProcess.costs.map.test3]);

	a(paymentReceiptUpload.totalAmount, 50);

	a.deep(aFrom(paymentReceiptUpload.applicableCosts),
		[businessProcess.costs.map.test, businessProcess.costs.map.test3]);

	businessProcess.costs.map.test.isOnlinePaymentInProgress = true;
	a.deep(aFrom(paymentReceiptUpload.applicableCostsForUserUpload),
		[businessProcess.costs.map.test3]);
	businessProcess.costs.map.test.delete('isOnlinePaymentInProgress');
	a.deep(aFrom(paymentReceiptUpload.applicableCostsForUserUpload),
		[businessProcess.costs.map.test, businessProcess.costs.map.test3]);
	businessProcess.costs.map.test.isPaidOnline = true;
	a.deep(aFrom(paymentReceiptUpload.applicableCostsForUserUpload),
		[businessProcess.costs.map.test3]);
	businessProcess.costs.map.test.delete('isPaidOnline');
	a.deep(aFrom(paymentReceiptUpload.applicableCostsForUserUpload),
		[businessProcess.costs.map.test, businessProcess.costs.map.test3]);

	a.h2("Initial");
	a(paymentReceiptUpload.isRejected, false);
	a(paymentReceiptUpload.isApproved, false);

	a.h2("Rejection");
	paymentReceiptUpload.status = 'invalid';
	a(paymentReceiptUpload.isRejected, false);
	a(paymentReceiptUpload.isApproved, false);
	a(paymentReceiptUpload.isApproved, false);
	paymentReceiptUpload.rejectReasonMemo = "Whatever ...";
	a(paymentReceiptUpload.isRejected, true);
	a(paymentReceiptUpload.isApproved, false);

	a.h2("Approval");
	paymentReceiptUpload.status = 'valid';
	a(paymentReceiptUpload.isRejected, false);
	a(paymentReceiptUpload.isApproved, true);
};
