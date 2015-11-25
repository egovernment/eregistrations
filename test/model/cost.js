'use strict';

var Database    = require('dbjs')
  , defineCosts = require('../../model/business-process-new/costs');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineCosts(db)
	  , cost;

	BusinessProcess.prototype.costs.map.define('test1', { nested: true });

	cost = BusinessProcess.prototype.costs.map.test1;

	cost.amount = 109;

	a(cost.isElectronic, false);
	cost.isOnlinePaymentInProgress = true;
	a(cost.isElectronic, true);
	cost.delete('isOnlinePaymentInProgress');
	a(cost.isElectronic, false);
	cost.isPaidOnline = true;
	a(cost.isElectronic, true);
	cost.delete('isPaidOnline');
	a(cost.isElectronic, false);
};
