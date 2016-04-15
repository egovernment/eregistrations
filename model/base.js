// db.Base extensions. Currently purely about base methods needed for JSON snapshots

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	ensureDb(db).Base.prototype.__descriptorPrototype__.setProperties({
		// Field (label: value) JSON serializer
		fieldToJSON: function (ignore) {
			var label = this.dynamicLabelKey ? this.object.get(this.dynamicLabelKey) : this.label
			  , value = this.object.get(this.key);
			if (value != null) {
				if (typeof value.toJSON === 'function') {
					value = value.toJSON(this);
				} else {
					if (this.database.isObjectType(this.type)) value = value.toString(this);
					else value = (new this.type(value)).toString(this);
				}
			}
			return {
				label: label,
				value: value
			};
		}
	});

	db.Base.prototype.defineProperties({
		// Whether value should be considered as empty
		isEmpty: {
			type: db.Function,
			value: function (value) { return false; }
		}
	});

	return db.Base.defineProperties({
		// Wether provided value should be considered empty
		isValueEmpty: { type: db.Function, value: function (value) {
			if (value == null) return true;
			if (typeof value.isEmpty !== 'function') return false;
			return value.isEmpty();
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
