'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , debug          = require('debug-ext')('sent-back-trigger')
  , setupTriggers  = require('../_setup-triggers');

module.exports = function (db) {
	var businessProcesses = ensureDatabase(db).BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
		.filterByKey('isSubmitted', true)
		.filterByKey('isSentBack', false);

	setupTriggers({
		preTrigger: businessProcesses.filterByKey('sentBackSteps',
			function (steps) { return !steps.size; }),
		trigger: businessProcesses.filterByKey('sentBackSteps',
			function (steps) { return steps.size > 0; })
	}, function (businessProcess) {
		debug('on for %s', businessProcess.__id__);
		businessProcess.isSentBack = true;
	});
};
