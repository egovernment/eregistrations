'use strict';

var Database = require('dbjs')
  , defineFlow = require('../../../model/business-process-new/flow')
  , defineMapCertificates = require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-requirement-uploads');

module.exports = function (t, a) {
	var db = new Database()
	  , Step = t(db)
	  , BusinessProcess = db.BusinessProcess
	  , businessProcess, step;

	var TestDocument = db.Document.extend('Test', {}, {
		label: { value: "Test document" }
	});

	defineFlow(db);
	BusinessProcess.prototype.requirements.map.define('req', { nested: true });
	BusinessProcess.prototype.requirements.map.req.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument]);
	defineMapUploads(BusinessProcess, [{ name: 'req', class: TestDocument }]);

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.define('requirements',
		{ value: function () { return [this.master.requirements.map.req]; } });

	BusinessProcess.prototype.processingSteps.map.define('revision', {
		nested: true,
		type: Step
	});
	businessProcess = new BusinessProcess();
	step = businessProcess.processingSteps.map.revision;

	a.h1("Initial");
	a(step.isApplicable, true);
	a(step.isReady, false);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h1("Submitted");
	businessProcess.requirementUploads.map.req.document.files.map.newUniq().path = '/elo.png';
	businessProcess.isSubmitted = true;
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h2("Not applicable");
	step.isApplicable = false;
	a(step.isApplicable, false);
	a(step.isReady, false);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	step.isApplicable = true;

	a.h2("Paused");
	step.status = 'paused';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, true);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h2("Sent back");
	step.status = 'sentBack';

	a.h3("Incomplete");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h3("Complete");
	businessProcess.requirementUploads.map.req.status = 'invalid';
	businessProcess.requirementUploads.map.req.rejectReasonTypes.add('illegible');
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, true);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h2("Rejected");
	step.status = 'rejected';

	a.h3("Incomplete");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h3("Complete");
	step.rejectionReason = "Whateever ..";
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, true);
	a(step.isApproved, false);
	a(step.isClosed, true);

	a.h2("Approved");
	step.status = 'approved';

	a.h3("Incomplete");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h3("Complete");
	businessProcess.requirementUploads.map.req.status = 'valid';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, true);
	a(step.isClosed, true);
};
