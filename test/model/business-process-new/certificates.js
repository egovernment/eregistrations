'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineDocument        = require('../../../model/document')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , TestDocument = Document.extend('Test', {}, { label: { value: "Test document" } })
	  , BusinessProcess = t(db)
	  , businessProcess;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.Document = TestDocument;
	defineMapCertificates(db, [TestDocument]);
	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.certificates.applicable), [businessProcess.certificates.map.test]);
	businessProcess.registrations.map.test.isRequested = false;
	a.deep(aFrom(businessProcess.certificates.applicable), []);
	businessProcess.registrations.map.test.isRequested = true;
	a.deep(aFrom(businessProcess.certificates.applicable), [businessProcess.certificates.map.test]);
	businessProcess.registrations.map.test.isApplicable = false;
	a.deep(aFrom(businessProcess.certificates.applicable), []);
	businessProcess.registrations.map.test.isApplicable = true;
	a.deep(aFrom(businessProcess.certificates.applicable), [businessProcess.certificates.map.test]);
	a.deep(aFrom(businessProcess.certificates.uploaded), []);
	businessProcess.certificates.map.test.files.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.certificates.uploaded), [businessProcess.certificates.map.test]);
};
