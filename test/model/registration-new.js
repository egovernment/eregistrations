'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineDocument        = require('../../model/document')
  , defineCertificates    = require('../../model/business-process-new/certificates')
  , defineMapCertificates = require('../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , TestDocument = Document.extend('Test', {}, { label: { value: "Test document" } })
	  , BusinessProcess = defineCertificates(db)
	  , businessProcess, registration;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument]);
	businessProcess = new BusinessProcess();
	registration = businessProcess.registrations.map.test;
	a(registration.label, "Test document");
	a(registration.isApplicable, true);
	a(registration.isMandatory, true);
	a(registration.isRequested, true);
	a.deep(aFrom(registration.certificates), [businessProcess.certificates.map.test]);
	a.deep(aFrom(registration.requirements), []);
	a.deep(aFrom(registration.costs), []);
};
