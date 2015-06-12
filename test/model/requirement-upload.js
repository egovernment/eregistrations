'use strict';

var Database          = require('dbjs')
  , defineFormSection = require('../../model/form-section')
  , defineUploads     = require('../../model/business-process-new/requirement-uploads')
  , defineMapUploads
	= require('../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = defineUploads(db)

	  , businessProcess, requirementUpload;

	var TestDocument = db.Document.extend('Test', { dataForm: { type: FormSection } }, {
		label: { value: "Test document" }
	});

	TestDocument.prototype.dataForm.propertyNames = ['foo'];
	BusinessProcess.prototype.define('foo', { required: true });
	defineMapUploads(db, [TestDocument]);

	businessProcess = new BusinessProcess();
	requirementUpload = businessProcess.requirementUploads.map.test;

	a.h1("Initial");
	a(requirementUpload.isRejected, false);
	a(requirementUpload.isApproved, false);

	a.h1("Rejection");
	requirementUpload.status = 'invalid';
	a(requirementUpload.isRejected, false);
	a(requirementUpload.isApproved, false);
	requirementUpload.rejectReasonTypes.add('illegible');
	a(requirementUpload.isRejected, true);
	a(requirementUpload.isApproved, false);
	requirementUpload.rejectReasonTypes.add('other');
	a(requirementUpload.isRejected, false);
	a(requirementUpload.isApproved, false);
	requirementUpload.rejectReasonMemo = "Whatever ...";
	a(requirementUpload.isRejected, true);
	a(requirementUpload.isApproved, false);

	a.h1("Approval");
	requirementUpload.status = 'valid';
	a(requirementUpload.isRejected, false);
	a(requirementUpload.isApproved, false);
	businessProcess.foo = 'bar';
	a(requirementUpload.isRejected, false);
	a(requirementUpload.isApproved, true);
};
