'use strict';

var $              = require('mano-legacy')
  , Currency       = $.legacyDb.Currency
  , Cost           = $.legacyDb.Cost
  , locale         = $.legacyDb.locale
  , fractionDigits = 0;

if (Cost.step) {
	while (Cost.step < 1) {
		++fractionDigits;
		Cost.step *= 10;
	}
}

module.exports = $.formatCurrency = function (amount) {
	return Currency.format(amount, {
		locale: locale,
		minimumFractionDigits: fractionDigits || null,
		maximumFractionDigits: fractionDigits || null,
		currencyDisplay: Currency.currencyDisplay,
		currency: Currency.isoCode,
		symbol: Currency.symbol
	});
};
