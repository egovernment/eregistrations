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
  , setupTriggers = require('../_setup-triggers')

  , forEach = Array.prototype.forEach, create = Object.create
  , nextTick = process.nextTick
  , configure;

exports = module.exports = [];

configure = function (conf) {
	conf = normalizeOpts(conf);
	conf.text = compileTpl(conf.text);
	if (conf.resolveUser != null) callable(conf.resolveUser);
	conf.variables = Object(conf.variables);
	exports.push(conf);
};

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
			var text, businessProcess, context = create(defaultContext), prop, statusLog
			  , official = null;
			if (conf.resolveUser) businessProcess = conf.resolveUser(target);
			else businessProcess = target;
			context.target = target;
			context.user = context.businessProcess = businessProcess;
			if (conf.resolveGetters) {
				for (prop in context) {
					if (typeof context[prop] === 'function') context[prop] = context[prop]();
				}
			}
			text = compact.call(resolveTpl(conf.text, context)).join('');
			statusLog = businessProcess.statusLog.map.newUniq();
			if (conf.official) {
				official = businessProcess.resolveSKeyPath(conf.official);
				if (official) official = official.value;
			}
			statusLog.setProperties({
				label: conf.label,
				time: new Date(Date.now() +
						(conf.timeShift ? (conf.timeShift * 100) : 0)),
				text: text
			});
			if (official) statusLog.official = official;
		});
	});
});
