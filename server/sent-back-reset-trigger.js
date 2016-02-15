'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , debug          = require('debug-ext')('sent-back-reset-trigger')
  , setupTriggers  = require('./_setup-triggers');

module.exports = function (db) {
	var processingSteps = ensureDatabase(db).ProcessingStep.instances
		.filterByKeyPath('isSentBack', true);

	setupTriggers({
		preTrigger: processingSteps.filterByKeyPath('isPreviousStepsSatisfied', false),
		trigger: processingSteps.filterByKeyPath('isPreviousStepsSatisfied', true)
	}, function (processingStep) {
		debug('clear for %s', processingStep.__id__);
		processingStep.status = null;
	});
};
