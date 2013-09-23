'use strict';

var isObject = require('es5-ext/object/is-object')
  , template = require('es5-ext/string/#/template')
  , deferred = require('deferred')
  , memoize  = require('memoizee/lib/primitive')
  , delay    = require('timers-ext/delay')
  , readFile = require('fs').readFileSync
  , path     = require('path')
  , readdir  = require('fs2/lib/readdir')
  , urlParse = require('url').parse
  , mano     = require('mano')
  , users    = require('../users')

  , basename = path.basename, dirname = path.dirname, resolve = path.resolve
  , defaults = mano.mail.config, defVars = { url: mano.env.url,
		domain: mano.env.url && urlParse(mano.env.url).host }
  , setup, getFrom, getTo;

getFrom = function (user, from) {
	if (from == null) return defaults.from;
	if (typeof from === 'function') return from(user);
	return from;
};

getTo = function (user, to) {
	if (to == null) return user.email;
	if (typeof to === 'function') return to(user);
	return to;
};

setup = function (path) {
	var dir = dirname(path), name = basename(path, '.js')
	  , settings = require(path), getSubject, getText, set, getTemplate;

	if (settings.trigger == null) throw new TypeError("No trigger found");
	if (typeof settings.trigger === 'function') {
		set = users.filter(settings.trigger);
	} else if (isObject(settings.trigger)) {
		set = settings.trigger;
	} else {
		set = users.filterByProperty(settings.trigger,
			(typeof settings.triggerValue === 'undefined') ? true :
					settings.triggerValue);
	}

	if (settings.variables) {
		settings.variables.url = mano.env.url;
		settings.variables.domain = defVars.domain;
	}

	getSubject = template.call(settings.subject, settings.variables || defVars);

	if (settings.text == null) {
		getText = template.call(readFile(resolve(dir, name + '.txt')),
			settings.variables || defVars);
	} else if (typeof settings.text === 'function') {
		getTemplate = memoize(function (path) {
			return template.call(readFile(resolve(dir, path + '.txt')),
				settings.variables || defVars);
		});
		getText = function (context) {
			return getTemplate(settings.text(context))(context);
		};
	} else {
		getText = template.call(settings.text, settings.variables || defVars);
	}

	set.on('add', delay(function (user) {
		var text;
		mano.db.valueObjectMode = true;
		text = getText(user);
		mano.db.valueObjectMode = false;
		mano.mail({
			from: getFrom(user, settings.from),
			to: getTo(user, settings.to),
			subject: getSubject(user),
			text: text
		});
	}, 500));
};

deferred.map(mano.apps, function (app) {
	return readdir(resolve(app.root, 'server/notifications'),
		{ pattern: /\.js$/ })(function (names) {
		names.forEach(function (filename) {
			setup(resolve(app.root, 'server/notifications', filename));
		});
	}, function (e) {
		if (e.code !== 'ENOENT') throw e;
	});
});
