// Routes for the views.

'use strict';

require('../../view/print-base');
require('../../view/user-base');

module.exports = exports = require('eregistrations/routes/official')(function () {
	var stepsMap = this.businessProcess.processingSteps.map, currentStep;
	stepsMap.some(function (step) {
		if (step.isPending) {
			currentStep = step;
			return true;
		}
	});
	return currentStep;
});

exports['[0-9][a-z0-9]*'] = exports['[0-9][a-z0-9]*/documents'];
exports['/'] = require('eregistrations/view/supervisor');
exports['print-supervisor-list'] = require('eregistrations/view/print-supervisor-table');
