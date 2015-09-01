// Defines certificate documents on business process certificates map

'use strict';

var ensureArray              = require('es5-ext/array/valid-array')
  , forEach                  = require('es5-ext/object/for-each')
  , copy                     = require('es5-ext/object/copy')
  , ensureObject             = require('es5-ext/object/valid-object')
  , ensureStringifiable      = require('es5-ext/object/validate-stringifiable-value')
  , uncapitalize             = require('es5-ext/string/#/uncapitalize')
  , endsWith                 = require('es5-ext/string/#/ends-with')
  , isType                   = require('dbjs/is-dbjs-type')
  , ensureType               = require('dbjs/valid-dbjs-type')
  , defineDocument           = require('../../document')
  , defineRequirementUpload  = require('../../requirement-upload')
  , defineRequirementUploads = require('../requirement-uploads')

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
	var db = ensureType(BusinessProcess).database, Document = defineDocument(db),
		RequirementUpload = defineRequirementUpload(db), uploadProps, definitions = create(null),
		typesMap = create(null), documentProperties = create(null), sanitizeClassName;
	defineRequirementUploads(db);
	sanitizeClassName = function (Upload) {
		var name;
		if (RequirementUpload.isPrototypeOf(Upload)) {
			if (!endsWith.call(Upload.__id__, 'RequirementUpload')) {
				throw new TypeError(Upload.__id__ + " RequirementUpload " +
					"class misses \'RequirementUpload\' postfix.");
			}
			name = uncapitalize.call(Upload.__id__).slice(0, -'RequirementUpload'.length);
		} else {
			name = uncapitalize.call(Upload.__id__);
		}
		return ensureStringifiable(name);
	};
	ensureArray(data).forEach(function (conf) {
		var Upload, name;
		if (!isType(ensureObject(conf))) {
			Upload = ensureType(conf.class);
			if (conf.name) {
				name = conf.name;
				name = ensureStringifiable(name);
			} else {
				name = sanitizeClassName(Upload);
			}
			uploadProps = copy(conf);
			delete uploadProps.name;
			delete uploadProps.class;
			documentProperties[name] = uploadProps;
		} else {
			Upload = conf;
			name = sanitizeClassName(Upload);
		}
		if (!Document.isPrototypeOf(Upload) && !RequirementUpload.isPrototypeOf(Upload)) {
			throw new TypeError(Upload.__id__ + " must extend Document or RequirementUplad.");
		}
		definitions[name] = { nested: true };
		if (RequirementUpload.isPrototypeOf(Upload)) {
			definitions[name].type = Upload;
			typesMap[name] = true;
		} else {
			typesMap[name] = Upload;
		}
	});
	BusinessProcess.prototype.requirementUploads.map.defineProperties(definitions);
	forEach(typesMap, function (Upload, name) {
		if (Upload !== true) {
			this[name].define('document', { type: Upload });
		}
		this[name].document.defineProperties(documentDefinitions);
		if (documentProperties[name]) {
			this[name].document.setProperties(documentProperties[name]);
		}
	}, BusinessProcess.prototype.requirementUploads.map);
	return BusinessProcess;
};
