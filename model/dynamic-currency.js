// Creates a new dynamic currency type and sets up a currency type choice property on target.
//
// @param Target {object} - the target object for type choice property
// @param typeName {string} - name for new dynamic currency type
// @param currencies {arrat} - array of supported currency types
//
// @returns {object} - new dynamic currency type
//
// Example:
//
// var defineCurrency = require('eregistrations/model/dynamic-currency');
//
// var CapitalCurrency = defineCurrency(BusinessProcess, 'CapitalCurrency', [
//     require('dbjs-ext/number/currency/us-dollar')(db),
//     require('dbjs-ext/number/currency/guatemalan-quetzal')(db)
// ]);
//
// BusinessProcess.prototype.defineProperties({
//     sharesCapital: {
//         type: CapitalCurrency
//         required: true
//     },
//     investmentCapital: {
//         type: CapitalCurrency
//         required: true
//     }
// });

'use strict';

var validDbType      = require('dbjs/valid-dbjs-type')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , defineCurrency   = require('dbjs-ext/number/currency')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , Map              = require('es6-map');

module.exports = function (Target, typeName, currencies) {
	var db            = validDbType(Target).database
	  , Currency      = defineCurrency(db)
	  , StringLine    = defineStringLine(db)
	  , currenciesMap = []
	  , currencyChoiceTypeName, currencyChoicePropertyName;

	// Validate typeName ends with Currency
	if (!endsWith.call(typeName, 'Currency')) {
		throw new TypeError(typeName + " dynamic currency class misses \'Currency\' postfix.");
	}

	// Prepare currency choice type and property name
	currencyChoiceTypeName = typeName + 'TypeChoice';
	currencyChoicePropertyName = typeName[0].toLowerCase() + typeName.slice(1) + 'Type';

	// Prepare currenciesMap
	currencies.forEach(function (CurrencyType) {
		currenciesMap.push([
			CurrencyType.__id__[0].toLowerCase() + CurrencyType.__id__.slice(1),
			{ label: CurrencyType.symbol }
		]);
	});

	// Define enum for currency choice property
	var CurrencyTypeChoice = StringLine.createEnum(currencyChoiceTypeName, new Map(currenciesMap));

	// Define currency choice property on target
	Target.prototype.define(currencyChoicePropertyName, {
		type: CurrencyTypeChoice,
		required: true
	});

	// Create new type for use by target.
	return db.Object.extend(typeName, {
		amount: { type: Currency },
		toString: { value: function (value) {
			var choicePropName = this.constructor.currencyChoicePropertyName
			  , typeName       = this.master.resolveSKeyPath(choicePropName).value
			  , Type           = this.database[typeName[0].toUpperCase() + typeName.slice(1)]
			  , amount         = this.amount || 0;

			return (new Type(amount)).toString(this.object.getDescriptor(this.key));
		} }
	}, {
		currencyChoicePropertyName: { value: currencyChoicePropertyName }
	});
};
