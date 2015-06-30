// Defines certificate documents on business process certificates map

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , isType              = require('dbjs/is-dbjs-type')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , defineDocument      = require('../../document')

  , create = Object.create;

var documentDefinitions = {
	uniqueKey: { value: function () { return this.owner.key; } },
	label: { value: function (_observe) {
		var requirement;
		// Master may not be a BusinessProcess (but e.g. Representative)
		// so there might not be requirements
		if (this.master.requirements) {
			requirement = this.master.requirements.map[this.owner.key];
			if (requirement && requirement.label) return _observe(requirement._label);
		}
		return this.constructor.label;
	} },
	legend: { value: function (_observe) {
		var requirement;
		// Master may not be a BusinessProcess (but e.g. Representative)
		// so there might not be requirements
		if (this.master.requirements) {
			requirement = this.master.requirements.map[this.owner.key];
			if (requirement && requirement.legend) return _observe(requirement._legend);
		}
		return this.constructor.legend;
	} }
};

module.exports = function (BusinessProcess, data) {
	var Document = defineDocument(ensureType(BusinessProcess).database)
	  , definitions = create(null), typesMap = create(null);
	ensureArray(data).forEach(function (conf) {
		var UploadDocument, name;
		if (!isType(ensureObject(conf))) {
			UploadDocument = ensureType(conf.class);
			name = ensureStringifiable(conf.name);
		} else {
			UploadDocument = conf;
			name = uncapitalize.call(UploadDocument.__id__);
		}
		if (!Document.isPrototypeOf(UploadDocument)) {
			throw new TypeError(UploadDocument.__id__ + " must extend Document.");
		}
		definitions[name] = { nested: true };
		typesMap[name] = UploadDocument;
	});
	BusinessProcess.prototype.requirementUploads.map.defineProperties(definitions);
	forEach(typesMap, function (UploadDocument, name) {
		this[name].define('document', { type: UploadDocument });
		this[name].document.defineProperties(documentDefinitions);
	}, BusinessProcess.prototype.requirementUploads.map);
	return BusinessProcess;
};
