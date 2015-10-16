'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , ProcessingStepBase = t(db)
	  , processingStep = new ProcessingStepBase();

	a(processingStep.isApplicable, true);
	a(processingStep.isClosed, false);
	a(processingStep.isSatisfied, false);

	processingStep.isRejected = true;
	a(processingStep.isClosed, true);

	processingStep.isRejected = false;
	a(processingStep.isClosed, false);

	processingStep.isApproved = true;
	a(processingStep.isSatisfied, true);
	a(processingStep.isClosed, true);
	processingStep.isApplicable = false;
	a(processingStep.isSatisfied, null);
};
