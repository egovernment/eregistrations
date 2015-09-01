'use strict';

var Database = require('dbjs')
  , defineRequirementUploads =
		require('../../../model/business-process-new/utils/define-requirement-uploads')
  , defineRequirements = require('../../../model/business-process-new/utils/define-requirements')
  , defineRequirement  = require('../../../model/requirement')
  , defineRegistration = require('../../../model/registration-new')
  , defineDocument     = require('../../../model/document')
  , defineBusinessProcess = require('../../../model/business-process-new');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , Registration = defineRegistration(db)
	  , Requirement  = defineRequirement(db)
	  , TestDocument = defineDocument(db).extend('Test')
	  , bp
	  , SignedDataForms = t(db)
	  , TestRegistration;

	TestDocument.newNamed('testDoc');
	TestRegistration = Registration.extend('TestRegistration', {
		certificates: { value: function () {
			return [this.database.testDoc];
		} },
		requirements: { value: function () {
			return [this.master.requirements.map.signedDataForms];
		} }
	});
	defineRequirements(BusinessProcess, [Requirement.extend('SignedDataFormsRequirement')]);
	defineRequirementUploads(BusinessProcess, [SignedDataForms]);
	BusinessProcess.prototype.
		registrations.map.define('testRegistration', { type: TestRegistration, nested: true });
	bp = new BusinessProcess();
	a(bp.requirementUploads.progress, 0);
	bp.registrations.map.testRegistration.isRequested = false;
	a(bp.requirementUploads.progress, 1);
	bp.registrations.map.testRegistration.isRequested = true;
	bp.requirementUploads.map.signedDataForms.document.isUpToDateByUser = true;
	a(bp.requirementUploads.progress, 0.5);
};
