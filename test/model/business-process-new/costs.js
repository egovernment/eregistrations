'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)
	  , businessProcess;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.costs.map.define('test1', { nested: true });
	BusinessProcess.prototype.costs.map.test1.amount = 20;
	BusinessProcess.prototype.costs.map.define('test2', { nested: true });
	BusinessProcess.prototype.costs.map.test2.amount = 31;
	BusinessProcess.prototype.registrations.map.test.costs = function () {
		return [this.master.costs.map.test1, this.master.costs.map.test2];
	};
	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.costs.applicable),
		[businessProcess.costs.map.test1, businessProcess.costs.map.test2]);
	businessProcess.registrations.map.test.isRequested = false;
	a.deep(aFrom(businessProcess.costs.applicable), []);
	businessProcess.registrations.map.test.isRequested = true;
	businessProcess.costs.applicable.first.isPaid = true;
	a.deep(aFrom(businessProcess.costs.paid), [businessProcess.costs.map.test1]);

	a(businessProcess.costs.paymentWeight, 0);
	a(businessProcess.costs.paymentProgress, 1);

	businessProcess.costs.applicable.last.isElectronic = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 0);

	businessProcess.costs.applicable.last.isPaid = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 1);

	businessProcess.costs.applicable.last.delete('isPaid');
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 0);

	businessProcess.costs.applicable.last.isOnlinePaymentInProgress = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 0.5);

	businessProcess.costs.applicable.last.isPaidOnline = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 1);

	businessProcess.costs.applicable.last.delete('isOnlinePaymentInProgress');
	businessProcess.costs.applicable.last.delete('isPaidOnline');
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 0);

	businessProcess.costs.isOnlinePaymentInProgress = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 0.5);

	businessProcess.costs.isPaidOnline = true;
	a(businessProcess.costs.paymentWeight, 1);
	a(businessProcess.costs.paymentProgress, 1);
};
