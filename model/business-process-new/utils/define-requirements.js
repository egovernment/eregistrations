// Defines requirement documents on business process requirements map

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , endsWith            = require('es5-ext/string/#/ends-with')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , isType              = require('dbjs/is-dbjs-type')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , defineDocument      = require('../../document')
  , defineRequirement   = require('../../requirement')
  , defineRequirements  = require('../requirements')

  , create = Object.create;

module.exports = function (BusinessProcess, data) {
	var db = ensureType(BusinessProcess).database, Document = defineDocument(db)
	  , Requirement = defineRequirement(db), definitions = create(null), typesMap = create(null);
	defineRequirements(db);
	ensureArray(data).forEach(function (conf) {
		//Required is either a Document or a Requirement
		var Required, name;
		if (!isType(ensureObject(conf))) Required = ensureType(conf.class);
		else Required = conf;
		if (Requirement.isPrototypeOf(Required)) {
			if (!endsWith.call(Required.__id__, 'Requirement')) {
				throw new TypeError(Required.__id__ + " Requirement class misses \'Requirement\' postfix.");
			}
		} else if (!Document.isPrototypeOf(Required)) {
			throw new TypeError(Required.__id__ + " must extend Document or Requirement.");
		}
		if (!isType(conf) && (conf.name != null)) {
			name = ensureStringifiable(conf.name);
		} else {
			name = uncapitalize.call(Required.__id__);
			if (Requirement.isPrototypeOf(Required)) {
				name = uncapitalize.call(Required.__id__).slice(0, -'Requirement'.length);
			}
		}
		definitions[name] = { nested: true };
		typesMap[name] = {};
		if (!isType(conf)) {
			if (conf.label) typesMap[name].label = conf.label;
			if (conf.legend) typesMap[name].legend = conf.legend;
		}
		if (Requirement.isPrototypeOf(Required)) {
			definitions[name].type = Required;
		} else {
			typesMap[name].Document = Required;
		}
	});
	BusinessProcess.prototype.requirements.map.defineProperties(definitions);
	forEach(typesMap, function (configItem, name) {
		// When no configItem.Document, than the requirement has been set by Requirement class
		if (configItem.Document) {
			this[name].Document = configItem.Document;
		}
		if (configItem.label) {
			this[name].label = configItem.label;
		}
		if (configItem.legend) {
			this[name].legend = configItem.legend;
		}
	}, BusinessProcess.prototype.requirements.map);
	return BusinessProcess;
};
