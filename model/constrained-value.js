// Sets up a dynamic constrains nested field.
//
// @param nestedProperty {property} - property to augment
// @param ValueType {class} - type used for value and resolvedValue
// @param constrains {object} - optional constrains to use for value normalization (can be min,
//     max or validate)
//
// Example:
//
// var defineConstrained = require('eregistrations/model/constrained-value')
//   , UsDollar          = require('dbjs-ext/number/currency/us-dollar')(db);
//
// BusinessProcessCompany.prototype.defineProperties({
//     sharesCapital: {
//         type: UsDollar,
//         label: _("-> Some test field")
//     },
//     investmentCapital: {
//         type: db.Object,
//         nested: true,
//         label: _("-> Some constrained field")
//     }
// });
//
// defineConstrained(BusinessProcessCompany.prototype.investmentCapital, UsDollar, {
//     max: function (_observe) {
//         return this.master._get ? _observe(this.master._sharesCapital)
//             : this.master.sharesCapital;
//     }
// });

'use strict';

var validObject   = require('es5-ext/object/valid-object')
  , validFunction = require('es5-ext/function/valid-function')
  , forEach       = require('es5-ext/object/for-each');

module.exports = function (nestedProperty, ValueType, constrains) {
	forEach(validObject(constrains), function (fn, key) {
		nestedProperty.define(key, {
			type: ValueType,
			value: validFunction(fn)
		});
	});

	nestedProperty.defineProperties({
		value: {
			type: ValueType
		},
		resolvedValue: {
			type: ValueType,
			value: function () {
				if ((this.min != null) && (this.value < this.min)) return null;
				if ((this.max != null) && (this.value > this.max)) return null;
				if ((this.validate != null) && (!this.validate)) return null;

				return this.value;
			}
		},
		toString: {
			value: function (value) {
				var valueTypeName = this.constructor.valueTypeName
				  , ValueType     = this.database[valueTypeName];

				return (new ValueType(this.resolvedValue)).toString(this.object.getDescriptor(this.key));
			}
		}
	});
};
