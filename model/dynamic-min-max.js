// Creates a new dynamic type for defining dynamic min and max invariants.
//
// @param typeName {string} - name for new dynamic type
// @param currencies {arrat} - type used for value and resolvedValue
//
// @returns {object} - new dynamic type
//
// Example:
//
// var defineMinMaxType = require('eregistrations/model/dynamic-min-max')
//   , UsDollar         = require('dbjs-ext/number/currency/us-dollar')(db);
//
// var MinMaxType = defineMinMaxType('MinMaxType', UsDollar);
//
// BusinessProcess.prototype.defineProperties({
//     sharesCapital: {
//         type: UsDollar
//         nested: true
//     },
//     investmentCapital: {
//         type: MinMaxType
//         nested: true
//     }
// });
// BusinessProcess.prototype.investmentCapital.set('max', function () {
//     return this.master._get ? _observe(this.master._sharesCapital) : this.master.sharesCapital;
// });

'use strict';

var validDbType = require('dbjs/valid-dbjs-type');

module.exports = function (typeName, ValueType) {
	var db = validDbType(ValueType).database;

	return db.Object.extend(typeName, {
		min: {
			type: db.Number,
			value: Number.NEGATIVE_INFINITY
		},
		max: {
			type: db.Number,
			value: Number.POSITIVE_INFINITY
		},
		value: {
			type: ValueType
		},
		resolvedValue: {
			type: ValueType,
			value: function () {
				if (this.value == null) return null;

				if (this.value < this.min) return null;
				if (this.value > this.max) return null;

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
	}, {
		valueTypeName: { value: ValueType.__id__ }
	});
};
