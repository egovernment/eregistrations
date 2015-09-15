'use strict';

var Database = require('dbjs')
  , defineBusinessProcess = require('../../../model/business-process-new')
  , defineMapCertificates
		= require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
		= require('../../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)

	  , businessProcess;
	t(db);
	var TestDocument = db.Document.extend('Test', {}, {
		label: { value: "Test document" }
	});

	BusinessProcess.prototype.defineProperties({
		foo: { required: true },
		bar: { required: true }
	});

	BusinessProcess.prototype.requirements.map.define('req', { nested: true });
	BusinessProcess.prototype.requirements.map.req.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument]);
	defineMapUploads(BusinessProcess, [{ name: 'req', class: TestDocument }]);

	businessProcess = new BusinessProcess();

	a(businessProcess.userUploads.applicable.size, 0);
};
