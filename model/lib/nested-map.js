// NestedMap model: An abstract class that allows us to handle map of nesteds
//
// It should be used for properties dedicated to hold multiple values of some type of object
// instances, when those objects doesn't make sense in stand-alone form.

// If stand-alone form is desired normal set properties (multiple: true) should be used instead.

// Good example of nested map, is map of files on document. Also most of business process multiple
// object properties qualify to be defined with nested map (e.g. representatives, branches etc,
// although in old versions they were defined as stand-alone).

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db/*, options*/) {
	var NestedMap = ensureDb(db).Object.extend('NestedMap', {
		// Map of objects
		map: { type: db.Object, nested: true },
		// Key of a property, which is decisive in whether object should be recognized
		cardinalPropertyKey: { type: db.Base, required: true },
		// Returns ordered set of all recognized objects from a map
		ordered: { type: db.Object, multiple: true, value: function (_observe) {
			var objects = [], cardinalPropertyKey = this.cardinalPropertyKey;
			if (!cardinalPropertyKey) return;
			_observe(this.map, true).forEach(function (object) {
				if (_observe(object.getObservable(cardinalPropertyKey)) == null) return;
				objects.push(object);
			});
			return objects.sort(function (a, b) {
				return a.getDescriptor(cardinalPropertyKey)._lastOwnModified_ -
					b.getDescriptor(cardinalPropertyKey)._lastOwnModified_;
			});
		} }
	});
	NestedMap.prototype.map._descriptorPrototype_.setProperties({
		nested: true,
		type: db.Object
	});
	return NestedMap;
}, { normalizer: require('memoizee/normalizers/get-1')() });
