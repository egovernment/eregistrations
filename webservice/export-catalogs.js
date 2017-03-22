'use strict';

var  ensureDb = require('dbjs/valid-dbjs')
  , memoize = require('memoizee');

module.exports = memoize(function (db) {
	// ensure db
	ensureDb(db);

	var catalogs = [];
	// all enums
	var enums = db.StringLine.extensions.toArray().filter(function (extension) {
		return extension.meta && extension.members;
	}).map(function (extension) {
		var catalogItem = { name: extension.__id__ };
		catalogItem.options = extension.members.toArray().map(function (option) {
			return { name: option, label: extension.meta[option].label };
		});
		return catalogItem;
	});
	[].push.apply(catalogs, enums);

	// services
	var services = db.BusinessProcess.extensions.toArray().map(function (bp) {
		return { name: bp.__id__, label: bp.prototype.label };
	});
	catalogs.push({ services: services });

	// documents
	var documents = db.Document.extensions.toArray().map(function (doc) {
		return { name: doc.__id__, label: doc.prototype.label };
	});
	catalogs.push({ documents: documents });

	// institutions
	var institutions = db.Institution.instances.toArray().map(function (institution) {
		return { name: institution.__id__, label: institution.name };
	});
	catalogs.push({ institutions: institutions });

	return catalogs;

}, { length: 0 });
