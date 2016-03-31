'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , debug          = require('debug-ext')('business-process-flow')
  , setupTriggers  = require('../_setup-triggers');

module.exports = function (db) {
	var businessProcesses = ensureDatabase(db).BusinessProcess.instances
		.filterByKey('isFromEregistrations', true);

	// isSubmitted
	setupTriggers({
		preTrigger: businessProcesses.filterByKey('guideProgress', 1).filterByKey('isSubmitted', false),
		trigger: businessProcesses.filterByKey('isSubmittedReady', true)
	}, function (businessProcess) {
		debug('%s submitted', businessProcess.__id__);
		businessProcess.isSubmitted = true;
	});
};
