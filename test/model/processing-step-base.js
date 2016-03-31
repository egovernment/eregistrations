'use strict';

var Database = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process-new/processing-steps');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , businessProcess, processingStep;

	BusinessProcess.prototype.processingSteps.map.define('foo', { nested: true });
	businessProcess = new BusinessProcess();
	processingStep = businessProcess.processingSteps.map.foo;

	businessProcess.set('isSubmitted', true);
	a(processingStep.isApplicable, true);
	a(processingStep.isClosed, false);
	a(processingStep.isSatisfiedReady, false);

	processingStep.isRejected = true;
	a(processingStep.isClosed, true);

	processingStep.isRejected = false;
	a(processingStep.isClosed, false);

	processingStep.isApproved = true;
	a(processingStep.isSatisfiedReady, true);
	a(processingStep.isClosed, true);
	processingStep.isApplicable = false;
	a(processingStep.isSatisfiedReady, true);
};
