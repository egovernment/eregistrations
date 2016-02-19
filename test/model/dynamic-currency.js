'use strict';

var Database = require('dbjs');

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
	a(masterObject.currencyField.hasPropertyDefined('value'), true);
	a(masterObject.currencyField.toString(), '');
	masterObject.currencyField.value = 42;
	a(masterObject.currencyField.toString(), '42');
	masterObject.dynamicCurrencyType = 'usDollar';
	a(masterObject.currencyField.toString(), '$42');
};
