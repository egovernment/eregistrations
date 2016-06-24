// db.Base extensions. Currently purely about base methods needed for JSON snapshots

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	// JSON resolvers, used to retrieve serializable data snapshots
	ensureDb(db).Base.prototype.__descriptorPrototype__.setProperties({
		labelToJSON: function (ignore) {
			return this.dynamicLabelKey ? this.object.get(this.dynamicLabelKey) : this.label;
		},
		valueToJSON: function (ignore) {
			var value = this.object.get(this.key), result;
			if (value && value.forEach && !this.nested && this.multiple) {
				result = [];
				value.forEach(function (value) { result.push(this.type.valueToJSON(value, this)); }, this);
				return result;
			}
			return this.type.valueToJSON(value, this);
		},
		fieldToJSON: function (ignore) {
			return {
				label: this.labelToJSON(),
				value: this.valueToJSON(),
				id: this.__valueId__
			};
		},
		isValueEmpty: function (ignore) {
			var value = this.object.get(this.key);
			if (value && value.forEach && !this.nested && this.multiple) return !value.size;
			return this.type.isValueEmpty(value);
		}
	});

	db.Base.prototype.defineProperties({
		isEmpty: { type: db.Function },
		toJSON: { type: db.Function }
	});

	db.Base.defineProperties({
		// Whether provided value should be considered empty
		isValueEmpty: { type: db.Function, value: function (value, desciptor) {
			if (value == null) return true;
			if (typeof value.isEmpty !== 'function') return false;
			return value.isEmpty();
		} },
		// Returns JSON representation of provided value (in many cases it's same as value)
		valueToJSON: { type: db.Function, value: function (value, descriptor) {
			if (value == null) return value;
			if (this.database.isObjectType(this)) {
				if (typeof value.toJSON === 'function') return value.toJSON(descriptor);
				return value.toString(descriptor);
			}
			return (new this(value)).toString(descriptor);
		} }
	});

	db.DateTime.valueToJSON = function (value, descriptor) {
		if (value == null) return value;
		if (this !== this.database.DateTime) return (new this(value)).toString(descriptor); // Date
		return { kind: 'dateTimeValue', value: Number(value) };
	};

	return db.Base;
}, { normalizer: require('memoizee/normalizers/get-1')() });
