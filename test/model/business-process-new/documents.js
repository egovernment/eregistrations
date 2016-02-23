'use strict';

var aFrom                 = require('es5-ext/array/from')
  , Database              = require('dbjs')
  , defineFormSection     = require('../../../model/form-section')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = t(db)

	  , businessProcess, businessProcessUpdate;

	var TestDocument = db.Document.extend('Test', { dataForm: { type: FormSection } }, {
		label: { value: "Test document" }
	});
	BusinessProcess.prototype.requirements.map.define('test2', { nested: true });
	BusinessProcess.prototype.requirements.map.test2.Document = TestDocument;
	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.define('requirements',
		{ value: function () { return [this.master.requirements.map.test2]; } });
	defineMapCertificates(BusinessProcess, [TestDocument]);
	defineMapUploads(BusinessProcess, [{ name: 'test2', class: TestDocument }]);

	businessProcess = new BusinessProcess();
	a.deep(aFrom(businessProcess.documents.uploaded), []);
	a.deep(aFrom(businessProcess.documents.processChainUploaded), []);

	businessProcess.certificates.map.test.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.documents.uploaded), [businessProcess.certificates.map.test]);
	a.deep(aFrom(businessProcess.documents.processChainUploaded),
		[businessProcess.certificates.map.test]);

	businessProcess.requirementUploads.map.test2.document.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.documents.uploaded),
		[businessProcess.certificates.map.test, businessProcess.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcess.documents.processChainUploaded),
		[businessProcess.certificates.map.test, businessProcess.requirementUploads.map.test2.document]);

	businessProcess.isClosed = true;
	businessProcessUpdate = new BusinessProcess();
	businessProcess.derivedBusinessProcess = businessProcessUpdate;
	a.deep(aFrom(businessProcess.documents.uploaded),
		[businessProcess.certificates.map.test, businessProcess.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcess.documents.processChainUploaded),
		[businessProcess.certificates.map.test, businessProcess.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcessUpdate.documents.uploaded), []);
	a.deep(aFrom(businessProcessUpdate.documents.processChainUploaded), []);

	businessProcessUpdate.certificates.map.test.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.documents.uploaded), [businessProcess.certificates.map.test,
		businessProcess.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcess.documents.processChainUploaded),
		aFrom(businessProcess.documents.uploaded));
	a.deep(aFrom(businessProcessUpdate.documents.uploaded),
		[businessProcessUpdate.certificates.map.test]);
	a.deep(aFrom(businessProcessUpdate.documents.processChainUploaded),
		[businessProcessUpdate.certificates.map.test]);

	businessProcessUpdate.requirementUploads.map.test2.document.files.map.newUniq().path = '/elo.png';
	a.deep(aFrom(businessProcess.documents.uploaded), [businessProcess.certificates.map.test,
		businessProcess.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcess.documents.processChainUploaded),
		aFrom(businessProcess.documents.uploaded));
	a.deep(aFrom(businessProcessUpdate.documents.uploaded),
		[businessProcessUpdate.certificates.map.test,
			businessProcessUpdate.requirementUploads.map.test2.document]);
	a.deep(aFrom(businessProcessUpdate.documents.processChainUploaded),
		[businessProcessUpdate.certificates.map.test,
			businessProcessUpdate.requirementUploads.map.test2.document]);
};
