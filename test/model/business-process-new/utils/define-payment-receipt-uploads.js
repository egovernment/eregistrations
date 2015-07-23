'use strict';

var Database      = require('dbjs')
  , defineUploads = require('../../../../model/business-process-new/payment-receipt-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineUploads(db);

	t(BusinessProcess, {
		test: { label: "Cost label", legend: "Cost legend" },
		test2: { label: "Cost2 label", legend: "Cost2 legend" },
		test4: { label: "Cost4 label", legend: "Cost4 legend" }
	});

	a(BusinessProcess.prototype.paymentReceiptUploads.map.test.document.label, "Cost label");
	a(BusinessProcess.prototype.paymentReceiptUploads.map.test.document.legend, "Cost legend");

	a(BusinessProcess.prototype.paymentReceiptUploads.map.test2.document.label, "Cost2 label");
	a(BusinessProcess.prototype.paymentReceiptUploads.map.test2.document.legend, "Cost2 legend");

	a(BusinessProcess.prototype.paymentReceiptUploads.map.bar, undefined);
};
