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
//         nested: true
//     },
//     investmentCapital: {
//         type: CapitalCurrency
//         nested: true
//     }
// });

'use strict';

var validDbType      = require('dbjs/valid-dbjs-type')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , defineCurrency   = require('dbjs-ext/number/currency')
  , defineStringLine = require('dbjs-ext/string/string-line')
  , defineCreateEnum = require('dbjs-ext/create-enum')
  , uncapitalize     = require('es5-ext/string/#/uncapitalize')
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

	defineCreateEnum(db);

	// Prepare currency choice type and property name
	currencyChoiceTypeName = typeName + 'TypeChoice';
	currencyChoicePropertyName = uncapitalize.call(typeName) + 'Type';

	// Prepare currenciesMap
	currencies.forEach(function (CurrencyType) {
		currenciesMap.push([
			uncapitalize.call(CurrencyType.__id__),
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
			  , amount         = this.amount || 0
			  , Type;

			if (typeName) {
				Type = this.database[typeName[0].toUpperCase() + typeName.slice(1)];
			} else {
				Type = this.database.Currency;
			}

			return (new Type(amount)).toString(this.object.getDescriptor(this.key));
		} }
	}, {
		currencyChoicePropertyName: { value: currencyChoicePropertyName }
	});
};
