'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process-new')
  , defineMapCertificates
		= require('../../model/business-process-new/utils/define-certificates');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = t(db)
	  , TestDocument = Document.extend('Test', {}, {
		label: { value: "Test document" }
	})
	  , document = new Document()

	  , file1 = document.files.map.newUniq()
	  , file2 = document.files.map.newUniq()
	  , file3 = document.files.map.newUniq()
	  , BusinessProcess = defineMapCertificates(defineBusinessProcess(db), [TestDocument])
	  , businessProcess = new BusinessProcess();

	file1.name = 'foo.js';
	file2.name = 'test.js';
	file3.name = 'bar.js';

	file1.path = '/marko';
	file3.path = '/elo';
	a.deep(aFrom(document.files.ordered), [file1, file3]);
	a(businessProcess.certificates.map.test.processingStep, null);
	businessProcess.processingSteps.map.define('processing', {
		nested: true,
		type: require('../../model/processing-step')(db)
	});
	a(businessProcess.certificates.map.test.processingStep.__id__,
		businessProcess.processingSteps.map.processing.__id__);
};
