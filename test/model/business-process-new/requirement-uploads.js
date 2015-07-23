'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess;

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
	BusinessProcess.prototype.requirements.map.req.isApplicable = false;

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.define('requirements',
		{ value: function () { return [this.master.requirements.map.req]; } });

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.requirementUploads.applicable), []);
	a.deep(aFrom(businessProcess.requirementUploads.uploaded), []);
	a(businessProcess.requirementUploads.progress, 1);

	businessProcess.requirements.map.req.isApplicable = true;
	a.deep(aFrom(businessProcess.requirementUploads.applicable),
		[businessProcess.requirementUploads.map.req]);
	a(businessProcess.requirementUploads.map.req.document.label, "Test document");
	a.deep(aFrom(businessProcess.requirementUploads.uploaded), []);
	a(businessProcess.requirementUploads.progress, 0);

	businessProcess.requirementUploads.map.req.document.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.requirementUploads.applicable),
		[businessProcess.requirementUploads.map.req]);
	a.deep(aFrom(businessProcess.requirementUploads.uploaded),
		[businessProcess.requirementUploads.map.req]);
	a(businessProcess.requirementUploads.progress, 1);
};
