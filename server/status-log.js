'use strict';

var template       = require('es5-ext/string/#/template')
  , mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , resolveTrigger = require('./_resolve-trigger')

  , forEach = Array.prototype.forEach
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
		user.statusLog.add(new StatusLog({
			label: conf.label,
			official: conf.official ? user[conf.official] : null,
			time: new Date(),
			text: conf.text(user)
		}));
	});
});
