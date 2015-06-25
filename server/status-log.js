'use strict';

var compact       = require('es5-ext/array/#/compact')
  , assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , callable      = require('es5-ext/object/valid-callable')
  , compileTpl    = require('es6-template-strings/compile')
  , resolveTpl    = require('es6-template-strings/resolve-to-array')
  , mano          = require('mano')
  , tryRequire    = require('mano/lib/utils/try-require').bind(require)
  , resolve       = require('path').resolve
  , setupTriggers = require('./_setup-triggers')

  , now = Date.now, forEach = Array.prototype.forEach, create = Object.create
  , nextTick = process.nextTick
  , stdout = process.stdout.write.bind(process.stdout)
  , StatusLog = mano.db.StatusLog
  , configure, time;

exports = module.exports = [];

configure = function (conf) {
	conf = normalizeOpts(conf);
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
	var defaultContext = {};
	if (conf.variables) assign(defaultContext, conf.variables);
	setupTriggers(conf, function (target) {
		nextTick(function () {
			var text, user, context = create(defaultContext), prop;
			if (conf.resolveUser) user = conf.resolveUser(target);
			else user = target;
			context.target = target;
			context.user = context.businessProcess = user;
			if (conf.resolveGetters) {
				for (prop in context) {
					if (typeof context[prop] === 'function') context[prop] = context[prop]();
				}
			}
			text = compact.call(resolveTpl(conf.text, context)).join('');
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
