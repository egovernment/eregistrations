'use strict';

var Database             = require('dbjs')
  , defineFormSection    = require('../../model/form-section')
  , defineFlow           = require('../../model/business-process-new/flow')
  , defineProcessingStep = require('../../model/processing-step');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , BusinessProcess = defineFlow(db)
	  , ProcessingStep  = defineProcessingStep(db)
	  , ProcessingStepGroup = t(db)
	  , businessProcess, step, groupStep;

	BusinessProcess.prototype.processingSteps.map.define('group',
		{ nested: true, type: ProcessingStepGroup });

	BusinessProcess.prototype.processingSteps.map.group.steps.map.define('test',
		{ nested: true, type: ProcessingStep });
	step = BusinessProcess.prototype.processingSteps.map.group.steps.map.test;
	step.define('dataForm', { type: FormSection });
	BusinessProcess.prototype.define('foo', { required: true });
	FormSection.prototype.propertyNames = ['foo'];
	businessProcess = new BusinessProcess();
	groupStep = businessProcess.processingSteps.map.group;
	step = groupStep.steps.map.test;

	a.h1("Initial");
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, false);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h1("Submitted");
	businessProcess.isSubmitted = true;
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, true);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h2("Not applicable");
	step.isApplicable = false;
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, true);
	a(groupStep.isClosed, true);
	step.isApplicable = true;

	a.h2("Paused");
	step.officialStatus = 'paused';
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, true);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h2("Sent back");
	step.officialStatus = 'sentBack';

	a.h3("Incomplete");
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, true);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h3("Complete");
	step.sendBackReason = "Whateever ..";
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, true);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h2("Rejected");
	step.officialStatus = 'rejected';

	a.h3("Incomplete");
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, true);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h3("Complete");
	step.rejectionReason = "Whateever ..";
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, true);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, true);

	a.h2("Approved");
	step.officialStatus = 'approved';

	a.h3("Incomplete");
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, true);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, false);
	a(groupStep.isClosed, false);

	a.h3("Complete");
	businessProcess.foo = true;
	a(groupStep.isApplicable, true);
	a(groupStep.isReady, true);
	a(groupStep.isPending, false);
	a(groupStep.isPaused, false);
	a(groupStep.isSentBack, false);
	a(groupStep.isRejected, false);
	a(groupStep.isApproved, true);
	a(groupStep.isClosed, true);

	a.h3("Parent check");
	a(step.parentGroup, groupStep);
};
