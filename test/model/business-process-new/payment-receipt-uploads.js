'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-payment-receipt-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess;

	BusinessProcess.prototype.costs.map.defineProperties({
		test: { nested: true },
		test2: { nested: true },
		test3: { nested: true },
		test4: { nested: true }
	});
	BusinessProcess.prototype.costs.map.test.amount = 10;
	BusinessProcess.prototype.costs.map.test2.amount = 20;
	BusinessProcess.prototype.costs.map.test3.amount = 40;

	defineMapUploads(BusinessProcess, {
		test: { label: "Cost label", legend: "Cost legend" },
		test2: { label: "Cost2 label", legend: "Cost2 legend" },
		test4: { label: "Cost4 label", legend: "Cost4 legend" }
	});
	BusinessProcess.prototype.costs.map.test3.paymentReceipt = function () {
		return this.master.paymentReceiptUploads.map.test;
	};
	BusinessProcess.prototype.costs.map.test4.paymentReceipt = function () {
		return this.master.paymentReceiptUploads.map.test;
	};

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.isRequested = false;
	BusinessProcess.prototype.registrations.map.test.costs = function () {
		var costs = this.master.costs.map;
		return [costs.test, costs.test2, costs.test3, costs.test4];
	};

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.paymentReceiptUploads.applicable), []);
	a.deep(aFrom(businessProcess.paymentReceiptUploads.uploaded), []);
	a(businessProcess.paymentReceiptUploads.progress, 1);

	businessProcess.registrations.map.test.isRequested = true;
	a.deep(aFrom(businessProcess.paymentReceiptUploads.applicable),
		[businessProcess.paymentReceiptUploads.map.test,
			businessProcess.paymentReceiptUploads.map.test2]);
	a.deep(aFrom(businessProcess.paymentReceiptUploads.uploaded), []);
	a(businessProcess.paymentReceiptUploads.progress, 0);

	businessProcess.paymentReceiptUploads.map.test2.document.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.paymentReceiptUploads.applicable),
		[businessProcess.paymentReceiptUploads.map.test,
			businessProcess.paymentReceiptUploads.map.test2]);
	a.deep(aFrom(businessProcess.paymentReceiptUploads.uploaded),
		[businessProcess.paymentReceiptUploads.map.test2]);
	a(businessProcess.paymentReceiptUploads.progress, 0.5);
};
