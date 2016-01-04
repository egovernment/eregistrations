'use strict';

var db      = require('mano').db
  , debug   = require('debug-ext')('is-sent-back-trigger')
  , verbose = require('debug-ext')('is-sent-back-trigger:verbose');

module.exports = function (/* options */) {
	var options = Object(arguments[0]), onSentBack, onClearSentBack;
	onSentBack =
		(typeof options.onSentBack === 'function') && options.onSentBack;
	onClearSentBack =
		(typeof options.onClearSentBack === 'function') && options.onClearSentBack;

	var sendBack = function (businessProcess) {
		debug('%s sentBack', businessProcess.__id__);

		if (businessProcess.isSentBack !== true) {
			businessProcess.isSentBack = true;
			if (onSentBack) {
				onSentBack.call(businessProcess);
			}
		}
	};

	var clearSentBack = function (businessProcess) {
		debug('%s clearing sentBack', businessProcess.__id__);

		if (businessProcess.isSentBack === true) {
			businessProcess.delete('isSentBack');
			if (onClearSentBack) {
				onClearSentBack.call(businessProcess);
			}
		}
	};

	var onChange = function (event) {
		if (event.type === 'add') {
			sendBack(event.value.master);
			return;
		}
		if (event.type === 'delete') {
			clearSentBack(event.value.master);
			return;
		}
		if (event.type === 'batch') {
			if (!event.added) return;
			if (!event.added.size) return;
			event.added.forEach(function (ev) {
				sendBack(ev.value.master);
			});
			event.deleted.forEach(function (ev) {
				clearSentBack(ev.value.master);
			});
			return;
		}

		verbose('Wrong event type: %s', event.type);
		throw new Error("Unsupported event: " + event.type);
	};

	var addListener = function (businessProcess) {
		sendBack(businessProcess);
		businessProcess.sentBackSteps.on('change', onChange);
	};

	var removeListener = function (businessProcess) {
		clearSentBack(businessProcess);
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
			if (!event.added) return;
			if (!event.added.size) return;
			event.added.forEach(addListener);
			event.deleted.forEach(removeListener);
			return;
		}
	};

	var businessProcesses = db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
		.filterByKey('sentBackSteps', function (steps) {
			return steps.size > 0;
		}).on('change', eventHandler);

	businessProcesses.forEach(addListener);
};
