'use strict';

var Database = require('dbjs')
  , defineBusinessProcess = require('../../../../model/business-process-new')
  , defineFrontDeskStep = require('../../../../model/processing-steps/front-desk')
  , defineInstitution   = require('../../../../model/institution');

module.exports = function (t, a) {
	var db = new Database()
	  , FrontDeskStep   = defineFrontDeskStep(db)
	  , Institution     = defineInstitution(db)
	  , BusinessProcess = defineBusinessProcess(db)
	  , PickupInstitutionFormSection = t(db)

	  , businessProcess = new BusinessProcess();

	Institution.newNamed('institutionA');
	Institution.newNamed('institutionB');
	businessProcess.processingSteps.map.define('frontDesk', {
		nested: true,
		type: FrontDeskStep
	});
	businessProcess.submissionForms.map.define('pickupInstitution', {
		nested: true,
		type: PickupInstitutionFormSection
	});

	a(businessProcess.submissionForms.map.pickupInstitution.isApplicable, false);
	a(businessProcess.submissionForms.map.pickupInstitution.status, 1);
	businessProcess.processingSteps.map.frontDesk.possibleInstitutions.add(db.institutionA);
	a(businessProcess.submissionForms.map.pickupInstitution.isApplicable, true);
	a(businessProcess.submissionForms.map.pickupInstitution.status, 1);
	businessProcess.processingSteps.map.frontDesk.possibleInstitutions.add(db.institutionB);
	a(businessProcess.submissionForms.map.pickupInstitution.status, 0);
	businessProcess.processingSteps.map.frontDesk.chosenInstitution = db.institutionB;
	a(businessProcess.submissionForms.map.pickupInstitution.status, 1);
	businessProcess.processingSteps.map.frontDesk.possibleInstitutions.delete(db.institutionB);
	a(businessProcess.submissionForms.map.pickupInstitution.status, 1);
	a(businessProcess.processingSteps.map.frontDesk.institution, db.institutionA);
};
