// BusinessProcess costs resolution

'use strict';

var memoize               = require('memoizee/plain')
  , definePercentage      = require('dbjs-ext/number/percentage')
  , defineCurrency        = require('dbjs-ext/number/currency')
  , defineMultipleProcess = require('../lib/multiple-process')
  , defineCost            = require('../cost')
  , defineBusinessProcess = require('./registrations')

  , definePaymentReceiptUploads;

module.exports = memoize(function (db/* options */) {
	var options         = Object(arguments[1])
	  , BusinessProcess = defineBusinessProcess(db, options)
	  , Percentage      = definePercentage(db)
	  , MultipleProcess = defineMultipleProcess(db)
	  , Currency        = defineCurrency(db)
	  , Cost            = defineCost(db);

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
		// Payable subset of applicable costs
		// More directly: all applicable costs that are non 0
		payable: { type: Cost, multiple: true, value: function (_observe) {
			var result = [];
			this.applicable.forEach(function (cost) {
				var isPayable = Boolean(cost._get ? _observe(cost._amount) : cost.amount);
				if (isPayable) result.push(cost);
			});
			return result;
		} },
		// Paid costs
		paid: { type: Cost, multiple: true, value: function (_observe) {
			var result = [];
			this.payable.forEach(function (cost) {
				if (_observe(cost._isPaid)) result.push(cost);
			});
			return result;
		} },
		// Electronic costs
		electronic: { type: Cost, multiple: true, value: function (_observe) {
			var result = [];
			this.payable.forEach(function (cost) {
				if (_observe(cost._isElectronic)) result.push(cost);
			});
			return result;
		} },
		// Global isOnlinePaymentInitialized indication
		// Should be used when we use one online payment for all costs (and that's default)
		// Otherwise there's a isOnlinePaymentInitialized on each cost to which we can refer
		isOnlinePaymentInitialized: { type: db.Boolean, value: function () {
			return this.isOnlinePaymentInProgress || this.isPaidOnline;
		} },
		// Global isPaidOnline indication
		// Should be used when we use one online payment for all costs (and that's default)
		// Otherwise there's a isPaidOnline on each cost to which we can refer
		isPaidOnline: { type: db.Boolean, value: false },
		// Global isOnlinePaymentInProgress indication
		// Should be used when we use one online payment for all costs (and that's default)
		// Otherwise there's a isOnlinePaymentInProgress on each cost to which we can refer
		isOnlinePaymentInProgress: { type: db.Boolean, value: false },
		// Payment progress
		paymentProgress: { type: Percentage, value: function (_observe) {
			var valid = 0, total = 0, paymentReceiptUploads = this.master.paymentReceiptUploads;
			// Eventual online payments
			if (this.electronic.size) {
				++total;
				if (this.electronic.every(function (cost) { return _observe(cost._isPaid); })) {
					++valid;
				} else if (this.electronic.some(function (cost) {
						return _observe(cost._isOnlinePaymentInProgress);
					})) {
					valid += 0.5;
				}
			}
			total += _observe(paymentReceiptUploads.applicable._size);
			valid += _observe(paymentReceiptUploads.uploaded._size);
			if (!total) return 1;
			return valid / total;
		} },
		// Payment weight
		// Indicates number of step user needs to take to complete payment step in Part A
		// e.g. one step per each payment receipt, and one step for one online payment
		// If it's zero, that means we should not show payment step at all
		paymentWeight: { type: Percentage, value: function (_observe) {
			var weight = 0;
			// We assume that there will be at most one online payment
			// that will cover all electronic costs
			if (this.electronic.size) ++weight;
			weight += _observe(this.master.paymentReceiptUploads.applicable._size);
			return weight;
		} },
		// Total for all payable costs
		totalAmount: { type: Currency, value: function (_observe) {
			var total = 0;
			this.payable.forEach(function (cost) {
				var amount = cost._get ? _observe(cost._amount) : cost.amount;
				total += amount;
			});
			return total;
		} }
	});

	if (!BusinessProcess.prototype.paymentReceiptUploads) {
		definePaymentReceiptUploads(db, options);
	}

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });

definePaymentReceiptUploads = require('./payment-receipt-uploads');
