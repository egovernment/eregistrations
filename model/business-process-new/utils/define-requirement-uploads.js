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
		typesMap = create(null), documentProperties = create(null), sanitizeRequirementName;
	defineRequirementUploads(db);
	sanitizeRequirementName = function (Upload) {
		if (!endsWith.call(Upload.__id__, 'RequirementUpload')) {
			throw new TypeError(Upload.__id__ + " RequirementUpload " +
				"class misses \'RequirementUpload\' postfix.");
		}
		return uncapitalize.call(Upload.__id__).slice(0, -'RequirementUpload'.length);
	};
	ensureArray(data).forEach(function (conf) {
		var Upload, name;
		if (!isType(ensureObject(conf))) {
			Upload = ensureType(conf.class);
			if (conf.name) {
				name = conf.name;
			} else if (RequirementUpload.isPrototypeOf(Upload)) {
				name = sanitizeRequirementName(Upload);
			} else {
				name = uncapitalize.call(Upload.__id__);
			}
			name = ensureStringifiable(name);
			uploadProps = copy(conf);
			delete uploadProps.name;
			delete uploadProps.class;
			if (Document.isPrototypeOf(Upload)) {
				documentProperties[name] = uploadProps;
			}
		} else {
			Upload = conf;
			if (RequirementUpload.isPrototypeOf(Upload)) {
				name = sanitizeRequirementName(Upload);
			} else {
				name = uncapitalize.call(Upload.__id__);
			}
		}
		if (!Document.isPrototypeOf(Upload) && !RequirementUpload.isPrototypeOf(Upload)) {
			throw new TypeError(Upload.__id__ + " must extend Document or RequirementUplad.");
		}
		definitions[name] = { nested: true };
		if (RequirementUpload.isPrototypeOf(Upload)) {
			definitions[name].type = Upload;
			typesMap[name] = Upload.prototype.document.constructor;
		} else {
			typesMap[name] = Upload;
		}
	});
	BusinessProcess.prototype.requirementUploads.map.defineProperties(definitions);
	forEach(typesMap, function (Upload, name) {
		this[name].define('document', { type: Upload });
		this[name].document.defineProperties(documentDefinitions);
		if (documentProperties[name]) {
			this[name].document.setProperties(documentProperties[name]);
		}
	}, BusinessProcess.prototype.requirementUploads.map);
	return BusinessProcess;
};
