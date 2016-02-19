// Sets up a dynamic constrains nested field.
//
// @param target {type/property} - the target of augmentation
// @param ValueType {class} - type used for value and resolvedValue
// @param constrains {object} - optional constrains to use for value normalization (can contain
//     dynamicConstraints with dynamic min, max or step definition or staticConstraints set to
//     static min, max or step values)
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
//     dynamicConstraints: {
//         max: function (_observe) {
//             return this.master._get ? _observe(this.master._sharesCapital)
//                 : this.master.sharesCapital;
//         }
//     }
// });

'use strict';

var _                  = require('mano').i18n
  , validateDbjsType   = require('dbjs/valid-dbjs-type')
  , validateDbjsObject = require('dbjs/valid-dbjs-object');

module.exports = function (target, ValueType/*, options*/) {
	var options = Object(arguments[2])
	  , db      = validateDbjsType(ValueType).database;

	validateDbjsObject(target);

	target.defineProperties({
		min: {
			type: db.Number,
			value: function () {
				return this.getDescriptor('value').min;
			}
		},
		max: {
			type: db.Number,
			value: function () {
				return this.getDescriptor('value').max;
			}
		},
		step: {
			type: db.Number,
			value: function () {
				return this.getDescriptor('value').step;
			}
		},
		resolvedValue: {
			type: ValueType,
			value: function (_observe) {
				try {
					this.validate(_observe);
				} catch (e) {
					return null;
				}

				return this.value;
			}
		},
		validate: {
			value: function (observeFunction) {
				var value = observeFunction(this._value)
				  , min, max;

				if (value == null) return;

				min = observeFunction(this._min);
				if ((min != null) && (value < min)) {
					throw new Error(this.errorValueTooSmall);
				}

				max = observeFunction(this._max);
				if ((max != null) && (value > max)) {
					throw new Error(this.errorValueTooLarge);
				}
			}
		},
		errorValueTooSmall: {
			value: _("Value cannot be less than ${ min }")
		},
		errorValueTooLarge: {
			value: _("Value cannot be greater than ${ max }")
		},
		toString: {
			value: function (ignore) {
				var value = this.resolvedValue
				  , type;

				if (value == null) return '';
				type = this.getDescriptor('value').type;

				return type.getObjectValue(value, this).toString(this);
			}
		}
	});

	if (options.dynamicConstraints != null) {
		target.setProperties(options.dynamicConstraints);
	}

	target.defineProperties({
		value: {
			type: ValueType
		}
	});

	if (options.staticConstraints != null) {
		target.getDescriptor('value').setProperties(options.staticConstraints);
	}

	return target;
};
