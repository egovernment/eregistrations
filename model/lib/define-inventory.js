/**
 * Utility for defining inventory nested. Can be invoked only once per system at the moment.
 * @param {Constructor} Target -
 * the object on which inventory will be created, usually it's BusinessProcess
 * @param {Object} { currencyType=db.Currency, key: item {Object} } -
 * key will be the name of a map holding certain inventory category i.e "assets", "furniture".
 * item can have following properties:
 * label {String}
 * inputPlaceholder {String},
 * addLabel {String}
 * @returns {Constructor} Target
 */

'use strict';

var memoize             = require('memoizee/plain')
  , ensureObject        = require('es5-ext/object/valid-value')
  , ensureDbjsType      = require('dbjs/valid-dbjs-type')
  , defineStringLine    = require('dbjs-ext/string/string-line')
  , defineNestedMap     = require('./nested-map')
  , forEach             = require('es5-ext/object/for-each');

module.exports = memoize(function (Target, data) {
	var db, StringLine, InventoryValue, target;
	ensureDbjsType(Target);
	target = Target.prototype;
	ensureObject(data);
	db = target.database;
	StringLine = defineStringLine(db);
	defineNestedMap(db);
	data.currencyType = ensureDbjsType(data.currencyType);
	InventoryValue = db.Object.extend('InventoryValue', {
		description: { type: StringLine },
		value: { type: data.currencyType }
	});
	target.defineProperties({
		inventory: {
			type: db.Object,
			nested: true
		},
		inventoryTotal: {
			type: data.currencyType,
			value: function (_observe) {
				var total = 0;
				this.inventory.forEach(function (itemsMap) {
					_observe(itemsMap.ordered).forEach(function (item) {
						total += _observe(item._value);
					});
				});

				return total;
			}
		}
	});
	delete data.currencyType;
	forEach(data, function (item, key) {
		ensureObject(item);
		target.inventory.defineNestedMap(key,
			{ itemType: InventoryValue, cardinalPropertyKey: "value" });

		target.inventory.getDescriptor(key).setProperties({
			label: item.label || null,
			description: item.description || null,
			inputPlaceholder: item.inputPlaceholder || null,
			addLabel: item.addLabel || null
		});
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
