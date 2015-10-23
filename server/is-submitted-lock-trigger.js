'use strict';

var db      = require('mano').db
  , debug   = require('debug-ext')('is-submitted-lock-trigger')
  , verbose = require('debug-ext')('is-submitted-lock-trigger:verbose');

var lockIsSubmitted = function (businessProcess) {
	debug('%s locking isSubmitted', businessProcess.__id__);

	if (businessProcess.getDescriptor('isSubmitted')._value_ !== true) {
		businessProcess.isSubmitted = true;
		businessProcess.isSubmittedLocked = true;
	}
};

var unlockIsSubmitted = function (businessProcess) {
	debug('%s unlocking isSubmitted', businessProcess.__id__);

	if (businessProcess.getDescriptor('isSubmitted')._value_ === true) {
		businessProcess.delete('isSubmitted');
		businessProcess.isSubmittedLocked = false;
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
