'use strict';

var db    = require('mano').db
  , debug = require('debug-ext')('send-back-reset-trigger');

module.exports = function () {
	var resetSentBack = function (processingStep) {
		if (processingStep.master.isSentBack) return;
		if (!processingStep.isSentBack) return;
		if (!processingStep.isPreviousStepsSatisfied) return;
		debug('%s resetting sentBack of', processingStep.__id__);
		processingStep.status = null;
	};

	var eventHandler = function (event) {
		if (event.type === 'add') return;
		if (event.type === 'delete') {
			resetSentBack(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (!event.deleted) return;
			event.deleted.forEach(resetSentBack);
			return;
		}

		throw new Error("Unsupported event: " + event.type);
	};

	var processingSteps = db.ProcessingStep.instances
		.filterByKeyPath('isSentBack', true)
		.filterByKeyPath('isPreviousStepsSatisfied', false)
		.on('change', eventHandler);

	processingSteps.forEach(resetSentBack);
};
