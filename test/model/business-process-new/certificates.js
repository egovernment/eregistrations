'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineDocument        = require('../../../model/document')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , TestDocument  = Document.extend('Test', { isToBeHandedOver: { value: true } },
			{ label: { value: "Test document" } })
	  , TestDocument2 = Document.extend('Test2', { isElectronic: { value: true } },
			{ label: { value: "Test document 2" } })
	  , BusinessProcess = t(db)
	  , businessProcess;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument, TestDocument2]);
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
	businessProcess.certificates.map.test.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.certificates.uploaded), [businessProcess.certificates.map.test]);
	BusinessProcess.prototype.registrations.map.define('test2', { nested: true });
	BusinessProcess.prototype.registrations.map.test2.Document = TestDocument2;
	a.deep(aFrom(businessProcess.certificates.applicable), [businessProcess.certificates.map.test,
		businessProcess.certificates.map.test2]);
	a.deep(aFrom(businessProcess.certificates.physical), [businessProcess.certificates.map.test]);
	a.deep(aFrom(businessProcess.certificates.electronic), [businessProcess.certificates.map.test2]);
	a.deep(aFrom(businessProcess.certificates.handoverApplicable),
		[businessProcess.certificates.map.test]);
};
