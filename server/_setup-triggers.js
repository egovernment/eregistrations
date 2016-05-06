'use strict';

var forEach        = require('es5-ext/object/for-each')
  , once           = require('timers-ext/once')
  , resolveTrigger = require('./_resolve-trigger')

  , create = Object.create;

module.exports = function (conf, onTrigger) {
	var postTrigger = resolveTrigger(conf.trigger, conf.triggerValue, conf.BusinessProcessType)
	  , preTrigger, prePool, postPool, clearPool, onPreTargetAdd, onPreTargetDelete, onPostTarget;

	if (conf.preTrigger) {
		preTrigger = resolveTrigger(conf.preTrigger, conf.preTriggerValue, conf.BusinessProcessType);
	}

	if (preTrigger) {
		prePool = create(null);
		postPool = create(null);
		clearPool = once(function () {
			var target = [];
			forEach(postPool, function (obj, id) {
				if (prePool[id] == null) {
					if (!preTrigger.has(obj)) return;
				} else {
					if (prePool[id] !== false) return;
				}
				target.push(obj);
			});
			prePool = create(null);
			postPool = create(null);
			target.forEach(onTrigger);
		});
		onPreTargetAdd = function (target) {
			prePool[target.__id__] = true;
			clearPool();
		};
		onPreTargetDelete = function (target) {
			prePool[target.__id__] = false;
			clearPool();
		};
		onPostTarget = function (target) {
			postPool[target.__id__] = target;
			clearPool();
		};
		preTrigger.on('change', function (event) {
			if (event.type === 'add') {
				onPreTargetAdd(event.value);
				return;
			}
			if (event.type === 'delete') {
				onPreTargetDelete(event.value);
				return;
			}
			if (event.type === 'batch') {
				if (event.added) event.added.forEach(onPreTargetAdd);
				if (event.deleted) event.deleted.forEach(onPreTargetDelete);
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
		postTrigger.forEach(onTrigger);
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
