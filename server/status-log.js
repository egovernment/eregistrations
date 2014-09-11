'use strict';

var callable       = require('es5-ext/object/valid-callable')
  , compileTpl     = require('es6-template-strings/compile')
  , resolveTpl     = require('es6-template-strings/resolve-to-string')
  , mano           = require('mano')
  , tryRequire     = require('mano/lib/utils/try-require').bind(require)
  , resolve        = require('path').resolve
  , setupTriggers  = require('./_setup-triggers')

  , now = Date.now, forEach = Array.prototype.forEach
  , nextTick = process.nextTick
  , stdout = process.stdout.write.bind(process.stdout)
  , StatusLog = mano.db.StatusLog
  , configure, time;

exports = module.exports = [];

configure = function (conf) {
	conf.text = compileTpl(conf.text);
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
	setupTriggers(conf, function (target) {
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
	});
});
stdout(" setup in " + ((now() - time) / 1000).toFixed(2) + "s\n");
