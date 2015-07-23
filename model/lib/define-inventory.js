'use strict';

var memoize             = require('memoizee/plain')
  , d                   = require('d')
  , ensureObject        = require('es5-ext/object/valid-value')
  , ensureDbjsType      = require('dbjs/valid-dbjs-type')
  , ensureDb            = require('dbjs/valid-dbjs')
  , defineStringLine    = require('dbjs-ext/string/string-line')
  , defineNestedMap     = require('./nested-map')
  , forEach             = require('es5-ext/object/for-each');

module.exports = memoize(function (db/*, options*/) {
	ensureDb(db);
	defineStringLine(db);
	defineNestedMap(db);
	Object.defineProperty(db.Object.prototype, 'defineInventory', d(
		function (propertyName, data) {
			var db, self, InventoryValue;
			db = this.database;
			ensureObject(data);
			if (!data.currencyType && !db.InventoryValue) {
				throw new TypeError("defineInventory expects a currencyType with first call." +
					"Dont't pass it afterwards!");
			}
			if (data.currencyType) {
				data.currencyType = ensureDbjsType(data.currencyType);
				InventoryValue = ensureDb(db).Object.extend('InventoryValue', {
					description: { type: db.StringLine },
					value: { type: data.currencyType }
				});
			}
			this.define(propertyName, {
				type: db.Object,
				nested: true
			});
			self = this;
			delete data.currencyType;
			forEach(data, function (item, key) {
				ensureObject(item);
				self[propertyName].defineNestedMap(key,
					{ itemType: InventoryValue, cardinalPropertyKey: "value" });

				self[propertyName].getDescriptor(key).setProperties({
					label: item.label || '',
					inputPlaceholder: item.inputPlaceholder || '',
					addLabel: item.addLabel || ''
				});
			});
		}
	));
}, { normalizer: require('memoizee/normalizers/get-1')() });
