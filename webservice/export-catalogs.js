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

	// services + roles
	var services = [];
	var processingSteps = [];
	var bpProcessingSteps = {};

	db.BusinessProcess.extensions.forEach(function (bp) {
		bp.prototype.processingSteps.map.forEach(function (step) {
			// if group - check the substeps
			if (step.steps) {
				step.steps.map.forEach(function (subStep) {
					bpProcessingSteps[subStep.key] = { name: subStep.key, label: subStep.label };
				});
			} else {
				bpProcessingSteps[step.key] = { name: step.key, label: step.label };
			}
		});

		services.push({ name: bp.__id__, label: bp.prototype.label });
	});
	processingSteps = Object.keys(bpProcessingSteps).map(function (key) {
		return bpProcessingSteps[key];
	});

	catalogs.push({ services: services });
	catalogs.push({ processingSteps: processingSteps });

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
