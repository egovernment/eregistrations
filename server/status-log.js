'use strict';

var compileTpl     = require('es6-template-strings/compile')
  , resolveTpl     = require('es6-template-strings/resolve-to-string')
  , mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , resolveTrigger = require('./_resolve-trigger')

  , now = Date.now, forEach = Array.prototype.forEach
  , nextTick = process.nextTick
  , stdout = process.stdout.write.bind(process.stdout)
  , StatusLog = mano.db.StatusLog
  , configure, time;

exports = module.exports = [];

configure = function (conf) {
	conf.trigger = resolveTrigger(conf.trigger, conf.triggerValue);
	conf.text = compileTpl(conf.text);
	delete conf.triggerValue;
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
	var onUser = function (user) {
		nextTick(function () {
			var text;
			text = resolveTpl(conf.text, conf.variables);
			user.statusLog.add(new StatusLog({
				label: conf.label,
				official: (conf.official && user[conf.official]) || null,
				time: new Date(Date.now() +
					(conf.timeShift ? (conf.timeShift * 100) : 0)),
				text: text
			}));
		});
	};
	conf.trigger.on('change', function (event) {
		if (event.type === 'add') {
			onUser(event.value);
			return;
		}
		if (event.type === 'delete') return;
		if (event.type === 'batch') {
			if (!event.added) return;
			if (!event.added.size) return;
			event.added.forEach(onUser);
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	});
});
stdout(" setup in " + ((now() - time) / 1000).toFixed(2) + "s\n");
