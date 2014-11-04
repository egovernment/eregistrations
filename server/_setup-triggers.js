'use strict';

var once           = require('timers-ext/once')
  , resolveTrigger = require('./_resolve-trigger')

  , create = Object.create;

module.exports = function (conf, onTrigger) {
	var postTrigger = resolveTrigger(conf.trigger, conf.triggerValue)
	  , preTrigger, prePool, clearPool, onPreTarget, onPostTarget;

	if (conf.preTrigger) preTrigger = resolveTrigger(conf.preTrigger, conf.preTriggerValue);

	if (preTrigger) {
		prePool = create(null);
		clearPool = once(function () { prePool = create(null); });
		onPreTarget = function (target) {
			if (prePool[target.__id__] === 'post') {
				onTrigger(target);
				return;
			}
			prePool[target.__id__] = 'pre';
			clearPool();
		};
		onPostTarget = function (target) {
			if (prePool[target.__id__] === 'pre') {
				onTrigger(target);
				return;
			}
			prePool[target.__id__] = 'post';
			clearPool();
		};
		preTrigger.on('change', function (event) {
			if (event.type === 'delete') {
				onPreTarget(event.value);
				return;
			}
			if (event.type === 'add') return;
			if (event.type === 'batch') {
				if (!event.deleted) return;
				event.deleted.forEach(onPreTarget);
				return;
			}
			console.log("Errorneous event:", event);
			throw new Error("Unsupported event: " + event.type);
		});
		postTrigger.on('change', function (event) {
			if (event.type === 'add') {
				onPostTarget(event.value);
				return;
			}
			if (event.type === 'delete') return;
			if (event.type === 'batch') {
				if (!event.added) return;
				event.added.forEach(onPostTarget);
				return;
			}
			console.log("Errorneous event:", event);
			throw new Error("Unsupported event: " + event.type);
		});
	} else {
		postTrigger.on('change', function (event) {
			if (event.type === 'add') {
				onTrigger(event.value);
				return;
			}
			if (event.type === 'delete') return;
			if (event.type === 'batch') {
				if (!event.added) return;
				event.added.forEach(onTrigger);
				return;
			}
			console.log("Errorneous event:", event);
			throw new Error("Unsupported event: " + event.type);
		});
	}

};
