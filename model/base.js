// db.Base extensions. Currently purely about base methods needed for JSON snapshots

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	ensureDb(db).Base.prototype.__descriptorPrototype__.setProperties({
		// Field (label: value) JSON serializer
		fieldToJSON: function (ignore) {
			var value = this.object.get(this.key), result;
			if (value.forEach && !this.nested && this.multiple) {
				result = [];
				value.forEach(function (value) { result.push(this.type.valueToJSON(value, this)); }, this);
				value = result;
			} else {
				value = this.type.valueToJSON(value, this);
			}
			return {
				label: this.dynamicLabelKey ? this.object.get(this.dynamicLabelKey) : this.label,
				value: value
			};
		}
	});

	db.Base.prototype.defineProperties({
		// Whether value should be considered as empty
		isEmpty: { type: db.Function },
		toJSON: { type: db.Function }
	});

	return db.Base.defineProperties({
		// Whether provided value should be considered empty
		isValueEmpty: { type: db.Function, value: function (value) {
			if (value == null) return true;
			if (typeof value.isEmpty !== 'function') return false;
			return value.isEmpty();
		} },
		// Returns JSON representation of provided value (in many cases it's same as value)
		valueToJSON: { type: db.Function, value: function (value, descriptor) {
			if (value == null) return value;
			if (this.database.isObjectType(this)) {
				if (typeof value.toJSON === 'function') return value.toJSON(this);
				return value.toString(descriptor);
			}
			return (new this(value)).toString(descriptor);
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
