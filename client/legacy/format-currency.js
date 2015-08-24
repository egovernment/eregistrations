'use strict';

var $        = require('mano-legacy')
  , Currency = $.legacyDb.Currency
  , Cost     = $.legacyDb.Cost

  , formatOptions = { fractionDigits: 0 };

if (Cost.step) {
	while (Cost.step < 1) {
		++formatOptions.fractionDigits;
		Cost.step *= 10;
	}
}

if (Currency.symbol) formatOptions.prefix = Currency.symbol;
else if (Currency.isoCode) formatOptions.prefix = Currency.isoCode + ' ';
else formatOptions.prefix = '';

module.exports = $.formatCurrency = function (amount) {
	return Currency.format(amount, formatOptions);
};
