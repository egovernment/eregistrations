'use strict';

var template       = require('./template')
  , mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , resolveTrigger = require('./_resolve-trigger')

  , forEach = Array.prototype.forEach
  , nextTick = process.nextTick
  , StatusLog = mano.db.StatusLog
  , configure;

exports = module.exports = [];

configure = function (conf) {
	conf.trigger = resolveTrigger(conf.trigger, conf.triggerValue);
	conf.text = template.call(conf.text, conf.variables);
	delete conf.triggerValue;
	exports.push(conf);
};

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
