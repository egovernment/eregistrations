'use strict';

var Database          = require('dbjs')
  , defineFormSection = require('../../model/form-section')
  , defineFlow        = require('../../model/business-process-new/flow');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = defineFlow(db)
	  , ProcessingStep = t(db)
	  , businessProcess, step;

	BusinessProcess.prototype.processingSteps.map.define('test',
		{ nested: true, type: ProcessingStep });
	BusinessProcess.prototype.processingSteps.map.test.define('dataForm', { type: FormSection });
	BusinessProcess.prototype.define('foo', { required: true });
	FormSection.prototype.propertyNames = ['foo'];
	businessProcess = new BusinessProcess();
	step = businessProcess.processingSteps.map.test;

	a.h1("Initial");
	a(step.constructor.__id__, 'ProcessingStep');
	a(step.isApplicable, true);
	a(step.isReady, false);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, false);
	a(step.isClosed, false);

	a.h1("Submitted");
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
	step.pauseProgress = 0;
	a(step.isPending, true);
	a(step.isPaused, false);

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
	step.sendBackReason = "Whateever ..";
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
	businessProcess.foo = true;
	a(step.isApplicable, true);
	a(step.isReady, true);
	a(step.isPending, false);
	a(step.isPaused, false);
	a(step.isSentBack, false);
	a(step.isRejected, false);
	a(step.isApproved, true);
	a(step.isClosed, true);
};
