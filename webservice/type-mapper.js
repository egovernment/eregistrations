'use strict';
var ensureDb = require('dbjs/valid-dbjs')
  , memoize = require('memoizee');

function TypeMapper(db, customCatalogs) {
	this.db = db;
	this.customCatalogs = customCatalogs;
}

TypeMapper.prototype.mapType = function (type) {
	if (!type) return null;

	// if custom catalog
	if (this.customCatalogs && this.customCatalogs.filter(function (cat) {
			return cat.name === type.__id__;
		}).length > 0) {
		return "enum";
	}

	// if enum
	if (type.__id__ === "File" || type.prototype instanceof this.db.File) return "file";
	// file
	if (type.meta && type.members) return "enum";
	// primitives
	if (type.__id__ === "String" || type.prototype instanceof this.db.String) return "string";
	if (type.__id__ === "Number" || type.prototype instanceof this.db.Number) return "number";
	if (type.__id__ === "Date" || type.prototype instanceof this.db.Date) return "date";
	if (type.__id__ === "Boolean" || type.prototype instanceof this.db.Boolean) return "boolean";

	// all other =  object
	return "object";
};

module.exports = memoize(function (db, customCatalogs) {

	ensureDb(db);
	return new TypeMapper(db, customCatalogs);

}, { length: 0 });
