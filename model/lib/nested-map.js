// NestedMap model: An abstract class that allows us to handle map of nesteds
//
// It should be used for properties dedicated to hold multiple values of some type of object
// instances, when those objects doesn't make sense in stand-alone form.

// If stand-alone form is desired, normal set properties (multiple: true) should be used instead.

// Good example of nested map, is map of files on document. Also most of business process multiple
// object properties qualify to be defined with nested map (e.g. representatives, branches etc,
// although in old versions they were defined as stand-alone).
// In order to use NestedMap you need to require it. After that you will have defineNestedMap
// accessible on db.Object.prototype.

'use strict';

var memoize             = require('memoizee/plain')
  , d                   = require('d')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject        = require('es5-ext/object/valid-value')
  , ensureDbjsType      = require('dbjs/valid-dbjs-type')
  , ensureDb            = require('dbjs/valid-dbjs');

module.exports = memoize(function (db/*, options*/) {
	var NestedMap = ensureDb(db).Object.extend('NestedMap', {
		// Map of objects
		map: { type: db.Object, nested: true, isValueEmpty: function () {
			return !this.object.ordered.size;
		} },
		// Key of a property, which is decisive in whether object should be recognized
		cardinalPropertyKey: { type: db.Base, required: true },
		// Returns ordered set of all recognized objects from a map
		ordered: { type: db.Object, multiple: true, value: function (_observe) {
			var objects = [], cardinalPropertyKey = this.cardinalPropertyKey;
			if (!cardinalPropertyKey) return;
			_observe(this.map, true).forEach(function (object) {
				if (_observe(object.resolveSKeyPath(cardinalPropertyKey).observable) == null) return;
				objects.push(object);
			});
			return objects.sort(function (a, b) {
				return a.resolveSKeyPath(cardinalPropertyKey).descriptor._lastOwnModified_ -
					b.resolveSKeyPath(cardinalPropertyKey).descriptor._lastOwnModified_;
			});
		} },
		isEmpty: { value: function (ignore) { return !this.ordered.size; } },
		hasItem: {
			type: db.Function,
			value: function (key) {
				if (!this.map.has(key)) return false;
				return this.ordered.has(this.map[key]);
			}
		},
		getItemProto: {
			type: db.Function,
			value: function (ignore) {
				return this.map.__descriptorPrototype__.type.prototype;
			}
		}
	});
	NestedMap.prototype.map._descriptorPrototype_.setProperties({
		nested: true,
		type: db.Object
	});

/**
 * @method defineNestedMap
 * @param {string} propertyName -
 * the name of the property on which the map will be created (i.e. "files")
 * @param {Object} [itemType=db.Object, cardinalPropertyKey=undefined] -
 * itemType will set the type for items in map and ordered,
 * cardinalPropertyKey will mark the property which determines existence of a givne item
 * @returns {Object} - the object on which defineNestedMap was called
 */

	Object.defineProperty(db.Object.prototype, 'defineNestedMap', d(
		function (propertyName, data) {
			var db, cardinalPropertyKey;
			db = this.database;
			ensureObject(data);
			if (data.itemType) {
				data.itemType = ensureDbjsType(data.itemType);
				if (!db.isObjectType(data.itemType)) {
					throw new TypeError("defineNestedMap expects itemType to be a db.Object");
				}
			}
			cardinalPropertyKey = ensureStringifiable(data.cardinalPropertyKey);
			this.define(propertyName, {
				type: db.NestedMap,
				nested: true
			});
			this[propertyName].defineProperties({
				ordered: { type: data.itemType || db.Object },
				cardinalPropertyKey: { value: cardinalPropertyKey }
			});
			this[propertyName].map._descriptorPrototype_.type = data.itemType || db.Object;

			// For chaining
			return this;
		}
	));

	return NestedMap;
}, { normalizer: require('memoizee/normalizers/get-1')() });
