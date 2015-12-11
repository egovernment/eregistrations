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

var validateDbjsType   = require('dbjs/valid-dbjs-type')
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
			value: function () {
				if ((this.min != null) && (this.value < this.min)) return null;
				if ((this.max != null) && (this.value > this.max)) return null;

				return this.value;
			}
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
