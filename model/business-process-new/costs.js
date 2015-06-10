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
		// If we integrate an online payment, this should reflect it's progress
		paymentProgress: { type: Percentage, value: 1 }
	});
	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
