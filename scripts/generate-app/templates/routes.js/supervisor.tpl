// Routes for the views.

'use strict';

require('../../view/print-base');
require('../../view/user-base');
require('eregistrations/view/customizations/business-process-official-no-form');

module.exports = exports = require('eregistrations/routes/supervisor')(function () {
	var stepsMap = this.businessProcess.processingSteps.map, currentStep;
	stepsMap.some(function (step) {
		if (step.isPending) {
			currentStep = step;
			return true;
		}
	});
	return currentStep;
});
