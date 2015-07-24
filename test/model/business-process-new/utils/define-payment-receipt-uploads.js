'use strict';

var aFrom         = require('es5-ext/array/from')
  , Database      = require('dbjs')
  , defineUploads = require('../../../../model/business-process-new/payment-receipt-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineUploads(db);

	BusinessProcess.prototype.costs.map.defineProperties({
		test: { nested: true },
		test2: { nested: true },
		test3: { nested: true },
		test4: { nested: true }
	});
	BusinessProcess.prototype.costs.map.test.amount = 10;
	BusinessProcess.prototype.costs.map.test2.amount = 20;
	BusinessProcess.prototype.costs.map.test3.amount = 40;

	t(BusinessProcess, {
		test: { label: "Cost label", legend: "Cost legend", costs: [
			BusinessProcess.prototype.costs.map.test,
			BusinessProcess.prototype.costs.map.test3
		] },
		test2: { label: "Cost2 label", legend: "Cost2 legend" },
		test4: { label: "Cost4 label", legend: "Cost4 legend" }
	});

	a(BusinessProcess.prototype.paymentReceiptUploads.map.test.document.label, "Cost label");
	a(BusinessProcess.prototype.paymentReceiptUploads.map.test.document.legend, "Cost legend");
	a.deep(aFrom(BusinessProcess.prototype.paymentReceiptUploads.map.test.costs), [
		BusinessProcess.prototype.costs.map.test,
		BusinessProcess.prototype.costs.map.test3
	]);

	a(BusinessProcess.prototype.paymentReceiptUploads.map.test2.document.label, "Cost2 label");
	a(BusinessProcess.prototype.paymentReceiptUploads.map.test2.document.legend, "Cost2 legend");
	a.deep(aFrom(BusinessProcess.prototype.paymentReceiptUploads.map.test2.costs), [
		BusinessProcess.prototype.costs.map.test2
	]);

	a(BusinessProcess.prototype.paymentReceiptUploads.map.bar, undefined);
	a.deep(aFrom(BusinessProcess.prototype.paymentReceiptUploads.map.test4.costs), [
		BusinessProcess.prototype.costs.map.test4
	]);
};
