// BusinessProcess costs resolution

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineCost            = require('../cost')
  , defineRegistrations   = require('./registrations');

module.exports = memoize(function (db/* options */) {
	var BusinessProcess = defineRegistrations(db, arguments[1])
	  , Percentage = definePercentage(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , Cost = defineCost(db);

	BusinessProcess.prototype.defineProperties({
		costs: { type: MultipleProcess, nested: true }
	});
	BusinessProcess.prototype.costs.map._descriptorPrototype_.type = Cost;
	BusinessProcess.prototype.costs.defineProperties({
		// Applicable costs resolved out of requested registrations
		applicable: { type: Cost, value: function (_observe) {
			var result = [];
			_observe(this.master.registrations.requested).forEach(function (registration) {
				_observe(registration.costs).forEach(function (cost) { result.push(cost); });
			});
			return result;
		} },
		// Paid costs
		paid: { type: Cost, mutiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (cost) {
				if (_observe(cost._isPaid)) result.push(cost);
			});
			return result;
		} },
		// Payment progress
		paymentProgress: { type: Percentage, value: function () {
			if (!this.applicable.size) return 1;
			return this.paid.size / this.applicable.size;
		} },
		// Payment progress for online payments
		// We require all online payments to be done in Part A stage.
		// So having this below 1, doesn't allow submit of application
		onlinePaymentProgress: { type: Percentage, value: function (_observe) {
			var valid = 0, total = 0;
			this.applicable.forEach(function (cost) {
				if (!cost.isElectronic) return;
				++total;
				if (_observe(cost._isPaid)) ++valid;
			});
			if (!total) return 1;
			return valid / total;
		} }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
