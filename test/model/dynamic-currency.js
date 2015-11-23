'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db         = new Database()
	  , MasterType = db.Object.extend('MasterType')

	  , masterObject;

	// ------------------ Setup ------------------

	var DynamicCurrency = t(MasterType, 'DynamicCurrency', [
		 require('dbjs-ext/number/currency/us-dollar')(db)
	]);

	MasterType.prototype.defineProperties({
		currencyField: {
			type: DynamicCurrency,
			nested: true
		}
	});

	masterObject = new MasterType();

	// ------------------ Tests ------------------

	a.h1('Dynamic fields');
	a(masterObject.hasPropertyDefined('dynamicCurrencyType'), true);
	a(masterObject.currencyField.hasPropertyDefined('amount'), true);
	a(masterObject.currencyField.toString(), '0.00');
	masterObject.currencyField.amount = 42;
	a(masterObject.currencyField.toString(), '42.00');
	masterObject.dynamicCurrencyType = 'usDollar';
	a(masterObject.currencyField.toString(), '$42.00');
};
