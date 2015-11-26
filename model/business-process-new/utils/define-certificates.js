// Defines certificate documents on business process certificates map

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , ensureObject        = require('es5-ext/object/valid-object')
  , ensureStringifiable = require('es5-ext/object/validate-stringifiable-value')
  , ensureType          = require('dbjs/valid-dbjs-type')
  , isType              = require('dbjs/is-dbjs-type')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , endsWith            = require('es5-ext/string/#/ends-with')
  , defineDocument      = require('../../document')
  , defineCertificates  = require('../certificates');

module.exports = function (BusinessProcess, data) {
	var db          = ensureType(BusinessProcess).database
	  , Document    = defineDocument(db)
	  , definitions = {};

	defineCertificates(db);

	ensureArray(data).forEach(function (conf) {
		var CertificateDocument, name;

		if (!isType(ensureObject(conf))) {
			CertificateDocument = ensureType(conf.class);

			if (conf.name) name = ensureStringifiable(conf.name);
		} else {
			CertificateDocument = conf;
		}

		if (!Document.isPrototypeOf(ensureType(CertificateDocument))) {
			throw new TypeError(CertificateDocument.__id__ + " must extend Document.");
		}

		if (!name) {
			name = uncapitalize.call(CertificateDocument.__id__);

			if (endsWith.call(name, 'Certificate')) {
				name = uncapitalize.call(CertificateDocument.__id__).slice(0, -'Certificate'.length);
			}
		}

		definitions[name] = {
			nested: true,
			type: CertificateDocument
		};
	});

	BusinessProcess.prototype.certificates.map.defineProperties(definitions);
	return BusinessProcess;
};
