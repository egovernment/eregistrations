'use strict';

var Database = require('dbjs')
  , defineFlow = require('../../../model/business-process-new/flow')
  , defineMapCertificates = require('../../../model/business-process-new/utils/define-certificates')
  , defineMapUploads
	= require('../../../model/business-process-new/utils/define-requirement-uploads')
  , defineCost = require('../../../model/cost')
  , definePaymentReceiptUploads =
		require('../../../model/business-process-new/utils/define-payment-receipt-uploads');

module.exports = function (t, a) {
	var db              = new Database()
	  , Step            = t(db)
	  , BusinessProcess = defineFlow(db)
	  , Cost            = defineCost(db)
	  , businessProcess, step;

	var TestDocument = db.Document.extend('Test', {}, {
		label: { value: "Test document" }
	});
	BusinessProcess.prototype.requirements.map.define('req', { nested: true });
	BusinessProcess.prototype.requirements.map.req.Document = TestDocument;
	defineMapCertificates(BusinessProcess, [TestDocument]);
	defineMapUploads(BusinessProcess, [{ name: 'req', class: TestDocument }]);

	BusinessProcess.prototype.registrations.map.define('test', { nested: true });
	BusinessProcess.prototype.registrations.map.test.define('requirements',
		{ value: function () { return [this.master.requirements.map.req]; } });

	BusinessProcess.prototype.costs.map.define('test', {
		type: Cost,
		nested: true
	});
	BusinessProcess.prototype.costs.map.test.setProperties({
		amount: 10
	});
	BusinessProcess.prototype.registrations.map.test.setProperties({
		costs: function () { return [this.master.costs.map.test]; }
	});

	definePaymentReceiptUploads(BusinessProcess, { test: { label: 'Test cost receipt' } });

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
	a(step.isRevisionApproved, false);
	a(step.isRevisionPending, false);
	a(step.isDataFormsProcessable, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);
	a(step.dataFormsRevisionProgress, 0);
	a(step.dataFormsApprovalProgress, 0);
	a(step.dataFormsSentBackProgress, 0);

	a.h1("Submitted");
	businessProcess.requirementUploads.map.req.document.files.map.newUniq().path = '/elo.png';
	businessProcess.paymentReceiptUploads.map.test.document.files.map.newUniq().path = '/elo.png';
	businessProcess.isSubmitted = true;
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);

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
	a(step.isRevisionPending, false);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);
	step.isApplicable = true;

	a.h2("Paused");
	step.officialStatus = 'paused';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, true);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, false);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);

	a.h2("Sent back");
	step.officialStatus = 'sentBack';

	a.h3("Incomplete - all");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);

	a.h3("Incomplete - data forms");
	businessProcess.requirementUploads.map.req.status = 'invalid';
	businessProcess.requirementUploads.map.req.rejectReasonTypes.add('illegible');
	businessProcess.paymentReceiptUploads.map.test.status = 'invalid';
	businessProcess.paymentReceiptUploads.map.test.rejectReasonMemo = 'Wrong amount';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0.66);
	a(step.dataFormsRevisionProgress, 0);
	a(step.dataFormsApprovalProgress, 0);
	a(step.dataFormsSentBackProgress, 0);

	a.h3("Complete");
	businessProcess.dataForms.status = 'rejected';
	businessProcess.dataForms.rejectReason = 'Wrong name';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, true);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, false);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 1);
	a(step.dataFormsRevisionProgress, 1);
	a(step.dataFormsApprovalProgress, 0);
	a(step.dataFormsSentBackProgress, 1);

	a.h2("Rejected");
	step.officialStatus = 'rejected';
	businessProcess.requirementUploads.map.req.status = null;
	businessProcess.paymentReceiptUploads.map.test.status = null;
	businessProcess.dataForms.status = null;

	a.h3("Incomplete");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);

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
	a(step.isRevisionPending, false);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);
	a(step.dataFormsRevisionProgress, 0);
	a(step.dataFormsApprovalProgress, 0);
	a(step.dataFormsSentBackProgress, 0);

	a.h2("Approved");
	step.officialStatus = 'approved';

	a.h3("Incomplete - all");
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0);
	a(step.approvalProgress, 0);
	a(step.revisionProgress, 0);

	a.h3("Incomplete - data forms");
	businessProcess.requirementUploads.map.req.status = 'valid';
	businessProcess.paymentReceiptUploads.map.test.status = 'valid';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, true);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);
	a(step.isRevisionPending, true);
	a(step.revisionApprovalProgress, 0.66);
	a(step.approvalProgress, 0.66);
	a(step.revisionProgress, 0.66);
	a(step.dataFormsRevisionProgress, 0);
	a(step.dataFormsApprovalProgress, 0);
	a(step.dataFormsSentBackProgress, 0);

	a.h3("Complete");
	businessProcess.dataForms.status = 'approved';
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, true);
	a(step.isClosed, true);
	a(step.isRevisionPending, false);
	a(step.revisionApprovalProgress, 1);
	a(step.approvalProgress, 1);
	a(step.revisionProgress, 1);
	a(step.dataFormsRevisionProgress, 1);
	a(step.dataFormsApprovalProgress, 1);
	a(step.dataFormsSentBackProgress, 0);
};
