'use strict';

var Database = require('dbjs')
  , defineRequirementUploads =
		require('../../../model/business-process-new/utils/define-requirement-uploads')
  , defineFormSection = require('../../../model/form-section')
  , defineBusinessProcess = require('../../../model/business-process-new');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , FormSection = defineFormSection(db)
	  , bp
	  , SignedDataForms = t(db)
	  , signedDataForms;

	BusinessProcess.prototype.defineProperties({
		guideProp: { type: db.String },
		testBoolean: { type: db.Boolean, value: false },
		testString: { type: db.String, value: 'abc' }
	});
	BusinessProcess.prototype.dataForms.map.define('test', {
		nested: true,
		type: FormSection
	});
	BusinessProcess.prototype.dataForms.map.test.setProperties({
		propertyNames: ['testBoolean', 'testString']
	});
	BusinessProcess.prototype.getDescriptor('determinants').type = FormSection;

	BusinessProcess.prototype.determinants.setProperties({
		propertyNames: ['guideProp']
	});

	defineRequirementUploads(BusinessProcess, [SignedDataForms]);
	bp = new BusinessProcess();
	bp.guideProp = 'Test';
	signedDataForms = bp.requirementUploads.map.signedDataForms.document;

	a(signedDataForms.isUpToDate, false);
	a(signedDataForms.isUpToDateByUser, false);
	signedDataForms.isUpToDateByUser = true;
	a(signedDataForms.isUpToDate, true);
	bp.testBoolean = true;
	a(signedDataForms.isUpToDate, false);
	signedDataForms.isUpToDateByUser = true;
	a(signedDataForms.isUpToDate, true);
};
