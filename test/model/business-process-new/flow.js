'use strict';

var Database              = require('dbjs')
  , defineFormSection     = require('../../../model/form-section')
  , defineProcessingStep  = require('../../../model/processing-step')
  , defineMapCertificates
	= require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , ProcessingStep = defineProcessingStep(db)
	  , BusinessProcess = t(db)

	  , businessProcess, step;

	var FormSection1 = FormSection.extend('FormSection1');
	FormSection.prototype.propertyNames = ['foo'];
	var FormSection2 = FormSection.extend('FormSection2');
	FormSection.prototype.propertyNames = ['bar'];
	var FormSection3 = FormSection.extend('FormSection3');
	FormSection.prototype.propertyNames = ['lorem'];
	var TestDocument = db.Document.extend('Test', { dataForm: { type: FormSection1 } }, {
		label: { value: "Test document" }
	});

	BusinessProcess.prototype.defineProperties({
		foo: { required: true },
		bar: { required: true },
		lorem: {}
	});

	BusinessProcess.prototype.requirements.map.define('req', { nested: true });
	BusinessProcess.prototype.requirements.map.req.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument]);
	defineMapUploads(BusinessProcess, [{ name: 'req', class: TestDocument }]);

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.define('requirements',
		{ value: function () { return [this.master.requirements.map.req]; } });

	BusinessProcess.prototype.dataForms.map.define('formSection2',
		{ nested: true, type: FormSection2 });

	BusinessProcess.prototype.processingSteps.map.define('test',
		{ nested: true, type: ProcessingStep });
	BusinessProcess.prototype.processingSteps.map.test.define('dataForm', { type: FormSection1 });
	BusinessProcess.prototype.processingSteps.map.define('frontDesk',
		{ nested: true, type: ProcessingStep });
	BusinessProcess.prototype.processingSteps.map.frontDesk.defineProperties({
		dataForm: { type: FormSection3 },
		isReady: { value: function (_observe) { return _observe(this.owner.test._isApproved); } }
	});

	businessProcess = new BusinessProcess();
	a(businessProcess.isSubmittedReady, false);
	a(businessProcess.isSubmitted, false);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'draft');

	businessProcess.bar = true;
	businessProcess.submissionForms.isAffidavitSigned = true;
	businessProcess.requirementUploads.map.req.document.files.map.newUniq().path = '/elo.png';
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, false);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'draft');

	businessProcess.isSubmitted = true; // Normally done by a service
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'process');

	step = businessProcess.processingSteps.map.test;
	step.officialStatus = 'sentBack';
	step.sendBackReason = "Whateever ..";
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'process');

	businessProcess.submissionForms.delete('isAffidavitSigned'); // Normally done by service
	businessProcess.isSentBack = true; // Normally done by service
	a(businessProcess.isSubmittedReady, false);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, true);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'sentBack');

	businessProcess.submissionForms.isAffidavitSigned = true;
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, true);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'sentBack');

	businessProcess.delete('isSentBack'); // Normally done by service
	step.delete('officialStatus'); // Normally done by service
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'process');

	step.officialStatus = 'rejected';
	step.rejectionReason = "Whateever ..";
	businessProcess.isRejected = true;
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, true);
	a(businessProcess.isClosed, true);
	a(businessProcess.status, 'closed');

	step.officialStatus = 'approved';
	businessProcess.foo = true;
	businessProcess.isRejected = false;
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, false);
	a(businessProcess.status, 'pickup');

	step = businessProcess.processingSteps.map.frontDesk;
	step.officialStatus = 'approved';
	businessProcess.lorem = true;
	businessProcess.isApproved = true;
	a(businessProcess.isSubmittedReady, true);
	a(businessProcess.isSubmitted, true);
	a(businessProcess.isSentBack, false);
	a(businessProcess.isRejected, false);
	a(businessProcess.isClosed, true);
	a(businessProcess.status, 'closed');
};
