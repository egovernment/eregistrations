'use strict';

var aFrom              = require('es5-ext/array/from')
  , Database           = require('dbjs')
  , defineFormSection  = require('../../model/form-section')
  , defineUploads      = require('../../model/business-process-new/requirement-uploads')
  , defineRequirements = require('../../model/business-process-new/requirements')
  , defineMapUploads
	= require('../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = defineUploads(db)

	  , businessProcess, requirementUpload, requirement;

	defineRequirements(db);

	var TestDocument = db.Document.extend('Test', { dataForm: { type: FormSection } }, {
		label: { value: "Test document" },
		legend: { value: "Legend of a document" }
	});

	TestDocument.prototype.dataForm.propertyNames = ['foo'];
	BusinessProcess.prototype.define('foo', { required: true });
	defineMapUploads(BusinessProcess, [TestDocument]);
	BusinessProcess.prototype.requirements.map.define('test', { nested: true });
	BusinessProcess.prototype.requirements.map.test.Document = TestDocument;

	businessProcess = new BusinessProcess();
	requirement = businessProcess.requirements.map.test;
	a(requirement.label, "Test document");
	a(requirement.legend, "Legend of a document");
	a(requirement.isApplicable, true);
	a(requirement.guideProgress, 1);
	requirementUpload = businessProcess.requirementUploads.map.test;
	a.deep(aFrom(requirement.uploads), [requirementUpload]);
};
