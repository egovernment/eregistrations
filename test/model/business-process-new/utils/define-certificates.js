'use strict';

var Database           = require('dbjs')
  , defineDocument     = require('../../../../model/document')
  , defineCertificates = require('../../../../model/business-process-new/certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , BusinessProcess = defineCertificates(db)
	  , Doc1 = Document.extend('Test1')
	  , Doc2 = Document.extend('Test2');

	t(BusinessProcess, [Doc1, Doc2]);

	a(BusinessProcess.prototype.certificates.map.test1 instanceof Doc1, true);
	a(BusinessProcess.prototype.certificates.map.test2 instanceof Doc2, true);
	a(BusinessProcess.prototype.certificates.map.foo, undefined);
};
