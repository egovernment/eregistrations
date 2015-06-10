// Defines certificate documents on business process certificates map

'use strict';

var ensureArray        = require('es5-ext/array/valid-array')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , ensureType         = require('dbjs/valid-dbjs-type')
  , defineDocument     = require('../../document')
  , defineCertificates = require('../certificates');

module.exports = function (db, documentClasses) {
	var BusinessProcess = defineCertificates(db), Document = defineDocument(db), definitions = {};
	ensureArray(documentClasses).forEach(function (CertificateDocument) {
		if (!Document.isPrototypeOf(ensureType(CertificateDocument))) {
			throw new TypeError(CertificateDocument.__id__ + " must extend Document.");
		}
		definitions[uncapitalize.call(CertificateDocument.__id__)] = {
			nested: true,
			type: CertificateDocument
		};
	});
	BusinessProcess.prototype.certificates.map.defineProperties(definitions);
	return BusinessProcess;
};
