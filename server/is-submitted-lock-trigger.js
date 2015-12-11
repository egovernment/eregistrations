'use strict';

var db      = require('mano').db
  , debug   = require('debug-ext')('is-submitted-lock-trigger')
  , verbose = require('debug-ext')('is-submitted-lock-trigger:verbose');

module.exports = function (/* options */) {
	var options = Object(arguments[0]), onLockIsSubmitted, onUnlockIsSubmitted;
	onLockIsSubmitted =
		(typeof options.onLockIsSubmitted === 'function') && options.onLockIsSubmitted;
	onUnlockIsSubmitted =
		(typeof options.onIsLockSubmitted === 'function') && options.onIsLockSubmitted;

	var lockIsSubmitted = function (businessProcess) {
		debug('%s locking isSubmitted', businessProcess.__id__);

		if (businessProcess.isSubmittedLocked !== true) {
			businessProcess.isSubmittedLocked = true;
			if (onLockIsSubmitted) {
				onLockIsSubmitted.call(businessProcess);
			}
		}
	};

	var unlockIsSubmitted = function (businessProcess) {
		debug('%s unlocking isSubmitted', businessProcess.__id__);

		if (businessProcess.isSubmittedLocked === true) {
			businessProcess.delete('isSubmittedLocked');
			if (onUnlockIsSubmitted) {
				onUnlockIsSubmitted.call(businessProcess);
			}
		}
	};

	var eventHandler = function (event) {
		if (event.type === 'add') {
			lockIsSubmitted(event.value);
			return;
		}
		if (event.type === 'delete') {
			unlockIsSubmitted(event.value);
			return;
		}
		if (event.type === 'batch') {
			if (!event.added) return;
			if (!event.added.size) return;
			event.added.forEach(lockIsSubmitted);
			event.deleted.forEach(unlockIsSubmitted);
			return;
		}

		verbose('Wrong event type: %s', event.type);
		throw new Error("Unsupported event: " + event.type);
	};

	var businessProcesses = db.BusinessProcess.instances
		.filterByKey('isFromEregistrations', true)
		.filterByKeyPath('isSentBack', true)
		.on('change', eventHandler);

	businessProcesses.forEach(lockIsSubmitted);
};
