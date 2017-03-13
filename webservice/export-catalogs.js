'use strict';

var  ensureDb = require('dbjs/valid-dbjs');

// make it array, it is easier for strongly typed end part to interpret it
var allCatalogs = [];

var initCatalogs = function (db) {
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
		return { name: bp.__id__, label: bp.label };
	});
	catalogs.push({ services: services });

	// registrations
	var registrations = db.Registration.extensions.toArray().map(function (reg) {
		return { name: reg.__id__, label: reg.label };
	});
	catalogs.push({ registrations: registrations });

	// documents
	var documents = db.Document.extensions.toArray().map(function (doc) {
		return { name: doc.__id__, label: doc.label };
	});
	catalogs.push({ documents: documents });

	// costs
	var costs = db.Cost.extensions.toArray().map(function (cost) {
		return { name: cost.__id__, label: cost.label };
	});
	catalogs.push({ costs: costs });

	// institutions
	var institutions = db.Institution.instances.toArray().map(function (institution) {
		return { name: institution.__id__, label: institution.name };
	});
	catalogs.push({ institutions: institutions });

	allCatalogs = catalogs;
};

module.exports = function (db/*, opts*/) {
	if (!allCatalogs.length) initCatalogs(db);
	return allCatalogs;
};
