'use strict';

var mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , resolveTrigger = require('./_resolve-trigger')
  , template       = require('./template')

  , now = Date.now, forEach = Array.prototype.forEach
  , nextTick = process.nextTick
  , stdout = process.stdout.write.bind(process.stdout)
  , StatusLog = mano.db.StatusLog
  , configure, time;

exports = module.exports = [];

configure = function (conf) {
	conf.trigger = resolveTrigger(conf.trigger, conf.triggerValue);
	conf.text = template.call(conf.text, conf.variables);
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
	conf.trigger.on('add', function (user) {
		nextTick(function () {
			var text;
			mano.db.valueObjectMode = true;
			text = conf.text(user);
			mano.db.valueObjectMode = false;
			user.statusLog.add(new StatusLog({
				label: conf.label,
				official: conf.official ? user[conf.official] : null,
				time: new Date(Date.now() +
					(conf.timeShift ? (conf.timeShift * 100) : 0)),
				text: text
			}));
		});
	});
});
console.log(" setup in " + ((now() - time) / 1000).toFixed(2) + "s\n");
