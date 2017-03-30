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
	catalogs.push({ enums: enums });

	// services + its roles
	var roles = [];
	var bpRoles ={};

	var services = db.BusinessProcess.extensions.toArray().map(function (bp) {
		bp.prototype.processingSteps.map.forEach(function (step){
			// if group - check the substeps
			if (step.steps) {
					step.steps.map.forEach(function (subStep) {
						bpRoles[subStep.key] = { name: subStep.key, label: subStep.label };
					});
			} else {
				bpRoles[step.key] = { name: step.key, label: step.label };
			}
		});
	
		return { name: bp.__id__, label: bp.prototype.label };
	});
	roles = Object.keys(bpRoles).map(function (key) {
			return bpRoles[key];
	});

	catalogs.push({ services: services });
	catalogs.push({ roles: roles });

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
