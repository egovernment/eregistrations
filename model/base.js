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
		valueToWebServiceJSON: function () {
			var value = this.object.get(this.key), result;
			if (value && value.forEach && !this.nested && this.multiple) {
				result = [];
				value.forEach(function (value) {
					result.push(this.type.valueToWebServiceJSON(value, this));
				}, this);
				return result;
			}
			return this.type.valueToWebServiceJSON(value, this);
		},
		typeToSchemaJSON: function (ignore) {
			var value = this.object.get(this.key);
			return this.type.typeToSchemaJSON(value, this);
		},
		fieldToJSON: function (ignore) {
			return {
				label: this.labelToJSON(),
				value: this.valueToJSON(),
				id: this.__valueId__
			};
		},
		fieldToWebServiceJSON: function (ignore) {
			return {
				name: this.key,
				value: this.valueToWebServiceJSON(),
				keyPath: this.__valueId__
			};
		},
		fieldToMetaJSON: function (ignore) {
			return {
				name: this.key,
				path: this.__valueId__,
				type: this.type.__id__,
				label: this.label,
				required: this.required,
				pattern: this.pattern
			};
		},
		fieldToSchemaJSON: function (ignore) {
			var schema = {};
			schema[this.key] = { label: this.labelToJSON() };
			Object.assign(schema[this.key], this.typeToSchemaJSON());
			return schema;
		},
		isValueEmpty: function (ignore) {
			var value = this.object.get(this.key);
			if (value && value.forEach && !this.nested && this.multiple) return !value.size;
			return this.type.isValueEmpty(value);
		}
	});

	db.Base.prototype.defineProperties({
		isEmpty: { type: db.Function },
		toJSON: { type: db.Function },
		toWebServiceJSON: { type: db.Function },
		toWebServiceJSONPrettyData: { type: db.Function },
		toWSSchema: { type: db.Function }
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
		} },
		valueToWebServiceJSON: { type: db.Function, value: function (value, descriptor) {
			var db = this.database;
			if (value == null) return value;
			// enums handling
			if (this.meta && this.members) {
				return { code: value };
			}
			if (db.Currency && (Object.getPrototypeOf(this) === db.Currency)) {
				return { currency: this.symbol, value: value };
			}
			if (db.isObjectType(this)) {
				if (typeof value.toWebServiceJSON === 'function') {
					return value.toWebServiceJSON(descriptor);
				}
				if (typeof value.toJSON === 'function') {
					return value.toJSON(descriptor);
				}
				return value.toString(descriptor);
			}
			return value;
		} },
		typeToSchemaJSON: { type: db.Function, value: function (value, descriptor) {
			var db = this.database;
			// enum
			if (this.meta && this.members) {
				return { type: "enum",  ref: descriptor.type.__id__ };
			}
			// file
			if (this.__id__ === "File" || this.prototype instanceof db.File) {
				return { type: "file" };
			}
			if (this.__id__ === 'Currency' || this.prototype instanceof db.Currency) {
				return { type: "currency" };
			}
			// primitives
			if (this.__id__ === "String" || this.prototype instanceof db.String) {
				return { type: "string" };
			}
			if (this.__id__ === "Number" || this.prototype instanceof db.Number) {
				return { type: "number" };
			}
			if (this.__id__ === "Date" || this.prototype instanceof db.Date) {
				return { type: "date" };
			}
			if (this.__id__ === "Boolean" || this.prototype instanceof db.Boolean) {
				return { type: "boolean" };
			}

			// all other =  object
			return { type: "object" };
		} }
	});

	db.DateTime.valueToJSON = function (value, descriptor) {
		if (value == null) return value;
		if (this !== this.database.DateTime) return (new this(value)).toString(descriptor); // Date
		return { kind: 'dateTimeValue', value: Number(value) };
	};

	return db.Base;
}, { normalizer: require('memoizee/normalizers/get-1')() });
