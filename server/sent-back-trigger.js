'use strict';

var db      = require('mano').db
  , debug   = require('debug-ext')('sent-back-trigger');

module.exports = function (/* options */) {
	var sendBack = function (businessProcess) {
		if (businessProcess.isSentBack !== true && businessProcess.sentBackSteps.size > 0) {
			debug('on for %s', businessProcess.__id__);
			businessProcess.isSentBack = true;
		}
	};

	var onChange = function (event) {
		if (event.type === 'delete') return;
		if (event.type === 'add') {
			sendBack(event.value.master);
			return;
		}
		if (event.type === 'batch') {
			if (!event.added) return;
			event.added.forEach(function (ev) {
				sendBack(ev.value.master);
			});
		}

		throw new Error("Unsupported event: " + event.type);
	};

	var addListener = function (businessProcess) {
		sendBack(businessProcess);
		businessProcess.sentBackSteps.on('change', onChange);
	};

	var removeListener = function (businessProcess) {
		businessProcess.sentBackSteps.off('change', onChange);
	};

	var eventHandler = function (event) {
		if (event.type === 'add') {
			addListener(event.value);
			return;
		}
		if (event.type === 'delete') {
			removeListener(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (event.added) {
				event.added.forEach(addListener);
			}
			if (event.deleted) {
				event.deleted.forEach(removeListener);
			}
		}
	};

	var businessProcesses = db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
		.filterByKey('sentBackSteps', function (steps) {
			return steps.size > 0;
		}).on('change', eventHandler);

	businessProcesses.forEach(addListener);
};
