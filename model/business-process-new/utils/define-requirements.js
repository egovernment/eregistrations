// Defines requirement documents on business process requirements map

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , forEach             = require('es5-ext/object/for-each')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , isType              = require('dbjs/is-dbjs-type')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , defineDocument      = require('../../document')
  , defineRequirements  = require('../requirements')

  , create = Object.create;

module.exports = function (BusinessProcess, data) {
	var db = ensureType(BusinessProcess).database, Document = defineDocument(db)
	  , definitions = create(null), typesMap = create(null);
	defineRequirements(db);
	ensureArray(data).forEach(function (conf) {
		var RequiredDocument, name;
		if (!isType(ensureObject(conf))) {
			RequiredDocument = ensureType(conf.class);
			name = ensureStringifiable(conf.name);
		} else {
			RequiredDocument = conf;
			name = uncapitalize.call(RequiredDocument.__id__);
		}
		if (!Document.isPrototypeOf(RequiredDocument)) {
			throw new TypeError(RequiredDocument.__id__ + " must extend Document.");
		}
		definitions[name] = { nested: true };
		typesMap[name] = { Document: RequiredDocument, label: conf.label, legend: conf.legend };
	});
	BusinessProcess.prototype.requirements.map.defineProperties(definitions);
	forEach(typesMap, function (configItem, name) {
		this[name].Document = configItem.Document;
		if (configItem.label) {
			this[name].label = configItem.label;
		}
		if (configItem.legend) {
			this[name].legend = configItem.legend;
		}
	}, BusinessProcess.prototype.requirements.map);
	return BusinessProcess;
};
