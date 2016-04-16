// db.Base extensions. Currently purely about base methods needed for JSON snapshots

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	ensureDb(db).Base.prototype.__descriptorPrototype__.setProperties({
		// Field (label: value) JSON serializer
		fieldToJSON: function (ignore) {
			return {
				label: this.dynamicLabelKey ? this.object.get(this.dynamicLabelKey) : this.label,
				value: this.type.valueToJSON(this.object.get(this.key))
			};
		}
	});

	db.Base.prototype.defineProperties({
		// Whether value should be considered as empty
		isEmpty: {
			type: db.Function,
			value: function (value) { return false; }
		},
		toJSON: {
			type: db.Function,
			value: function (descriptor) { return this.toString(descriptor); }
		}
	});

	return db.Base.defineProperties({
		// Wether provided value should be considered empty
		isValueEmpty: { type: db.Function, value: function (value) {
			if (value == null) return true;
			if (typeof value.isEmpty !== 'function') return false;
			return value.isEmpty();
		} },
		// Returns JSON representation of provided value (in many cases it's same as value)
		valueToJSON: { type: db.Function, value: function (value) {
			if (value == null) return value;
			if (typeof value.toJSON === 'function') return value.toJSON(this);
			return (new this(value)).toJSON(this);
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
