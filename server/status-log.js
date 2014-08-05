'use strict';

var callable       = require('es5-ext/object/valid-callable')
  , compileTpl     = require('es6-template-strings/compile')
  , resolveTpl     = require('es6-template-strings/resolve-to-string')
  , once           = require('timers-ext/once')
  , mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , resolveTrigger = require('./_resolve-trigger')

  , create = Object.create, now = Date.now, forEach = Array.prototype.forEach
  , nextTick = process.nextTick
  , stdout = process.stdout.write.bind(process.stdout)
  , StatusLog = mano.db.StatusLog
  , configure, time;

exports = module.exports = [];

configure = function (conf) {
	conf.trigger = resolveTrigger(conf.trigger, conf.triggerValue);
	conf.text = compileTpl(conf.text);
	delete conf.triggerValue;
	if (conf.preTrigger) conf.preTrigger = resolveTrigger(conf.preTrigger, conf.preTriggerValue);
	delete conf.preTriggerValue;
	if (conf.resolveUser != null) callable(conf.resolveUser);
	conf.variables = Object(conf.variables);
	exports.push(conf);
};

time = now();
stdout("Setup status log...");
mano.apps.forEach(function (app) {
	var conf = tryRequire(resolve(app.root, 'server/status-log'));
	if (!conf) return;
	forEach.call(conf, configure);
});

exports.forEach(function (conf) {
	var prePool, clearPrePool, onPostTarget, onPreTarget, onTrigger;
	onTrigger = function (target) {
		nextTick(function () {
			var text, user;
			if (conf.resolveUser) user = conf.resolveUser(target);
			else user = target;
			conf.variables.target = target;
			conf.variables.user = user;
			text = resolveTpl(conf.text, conf.variables);
			delete conf.variables.user;
			user.statusLog.add(new StatusLog({
				label: conf.label,
				official: (conf.official && user[conf.official]) || null,
				time: new Date(Date.now() +
					(conf.timeShift ? (conf.timeShift * 100) : 0)),
				text: text
			}));
		});
	};

	if (conf.preTrigger) {
		prePool = create(null);
		clearPrePool = once(function () { prePool = create(null); });
		onPreTarget = function (target) {
			if (prePool[target.__id__] === 'post') {
				onTrigger(target);
				return;
			}
			prePool[target.__id__] = 'pre';
			clearPrePool();
		};
		onPostTarget = function (target) {
			if (prePool[target.__id__] === 'pre') {
				onTrigger(target);
				return;
			}
			prePool[target.__id__] = 'post';
			clearPrePool();
		};
		conf.preTrigger.on('change', function (event) {
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
		conf.trigger.on('change', function (event) {
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
		conf.trigger.on('change', function (event) {
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
});
stdout(" setup in " + ((now() - time) / 1000).toFixed(2) + "s\n");
