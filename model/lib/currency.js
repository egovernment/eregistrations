'use strict';

var memoize        = require('memoizee/plain')
  , d              = require('d')
  , defineCurrency = require('dbjs-ext/number/currency')
  , isInteger      = require('es5-ext/number/is-integer')
  , isNumber       = require('es5-ext/object/is-number-value')
  , BigNumber      = require('bignumber.js')
  , defineProperty = Object.defineProperty;

module.exports = memoize(function (db) {
	var Currency = defineCurrency(db);

	Currency.define('normalize', { type: db.Function, value: function (value/*, descriptor*/) {
		var descriptor = arguments[1]
		  , minv       = descriptor ? descriptor.min : null
		  , maxv       = descriptor ? descriptor.max : null
		  , step       = descriptor ? descriptor.step : null
		  , sign;

		if (isNaN(value)) return null;
		value = Number(value);

		minv = ((minv != null) && !isNaN(minv)) ? Math.max(minv, this.min) : this.min;
		if (value < minv) return null;

		maxv = ((maxv != null) && !isNaN(maxv)) ? Math.min(maxv, this.max) : this.max;
		if (value > maxv) return null;

		step = ((step != null) && !isNaN(step)) ? step : this.step;
		if (!step) return value;

		sign = (value >= 0) ? 1 : -1;
		return sign * Math.round(Math.abs(value) * (1 / step)) / (1 / step);
	} });

	return Currency;
}, { normalizer: require('memoizee/normalizers/get-1')() });
