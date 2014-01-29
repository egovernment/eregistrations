'use strict';

var isObject = require('es5-ext/object/is-object')
  , map      = require('es5-ext/object/map')
  , deferred = require('deferred')
  , memoize  = require('memoizee/lib/primitive')
  , delay    = require('timers-ext/delay')
  , readFile = require('fs').readFileSync
  , path     = require('path')
  , readdir  = require('fs2/lib/readdir')
  , urlParse = require('url').parse
  , mano     = require('mano')
  , users    = require('../users')
  , template = require('./template')
  , isCallable = require('es5-ext/object/is-callable')
  , escape = require('ent').encode

  , basename = path.basename, dirname = path.dirname, resolve = path.resolve
  , defaults = mano.mail.config, defVars = { url: mano.env.url,
		domain: mano.env.url && urlParse(mano.env.url).host }
  , setup, getFrom, getTo, getCc, escapeWrap, getAttachments;

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

getCc = function (user, cc) {
	if (cc == null) return null;
	if (typeof cc === 'function') return cc(user);
	return cc;
};

getAttachments = function (user, att) {
	if (att == null) return null;
	if (typeof att === 'function') {
		return att(user);
	}
	return [];
};

escapeWrap = function (settings) {
	return map(settings, function (value) {
		if (value && isCallable(value)) {
			return function (ctx) {
				return escape(value(ctx));
			};
		}
		return escape(value);
	});
};

setup = function (path) {
	var dir = dirname(path), name = basename(path, '.js')
	  , settings = require(path), getSubject, getText, set, getTemplate
	  , sendMail, content, vars;

	if (settings.trigger == null) throw new TypeError("No trigger found");
	if (typeof settings.trigger === 'function') {
		set = users.filter(settings.trigger);
	} else if (isObject(settings.trigger)) {
		set = settings.trigger;
	} else {
		set = users.filterByKey(settings.trigger,
			(typeof settings.triggerValue === 'undefined') ? true :
					settings.triggerValue);
	}

	if (settings.variables) {
		settings.variables.url = mano.env.url;
		settings.variables.domain = defVars.domain;
	}

	getSubject = template.call(settings.subject, settings.variables || defVars);

	if (settings.text == null) {
		try {
			content = readFile(resolve(dir, name + '.txt'));
		} catch (e) {
			if (e.code !== 'ENOENT') throw e;
			content = readFile(resolve(dir, name + '.html'));
			settings.isHtml = true;
		}
		vars = settings.variables || defVars;
		if (settings.isHtml) vars = escapeWrap(vars);
		getText = template.call(content, vars);
	} else if (typeof settings.text === 'function') {
		getTemplate = memoize(function (path) {
			return template.call(readFile(resolve(dir, path + '.txt')),
				settings.variables || defVars);
		});
		getText = function (context) {
			return getTemplate(settings.text(context))(context);
		};
	} else {
		vars = settings.variables || defVars;
		if (settings.isHtml) vars = escapeWrap(vars);
		getText = template.call(settings.text, vars);
	}

	sendMail = delay(function (user) {
		var text, mailOpts;
		mano.db.valueObjectMode = true;
		text = getText(user);
		mano.db.valueObjectMode = false;
		mailOpts = {
			from: getFrom(user, settings.from),
			to: getTo(user, settings.to),
			cc: getCc(user, settings.cc),
			subject: getSubject(user),
			attachments: getAttachments(user, settings.attachments)
		};
		if (settings.isHtml) mailOpts.html = text;
		else mailOpts.text = text;
		mano.mail(mailOpts);
	}, 500);

	set.on('change', function (event) {
		if (event.type === 'add') {
			sendMail(event.value);
			return;
		}
		if (event.type === 'delete') return;
		if (event.type === 'batch') {
			if (!event.added) return;
			if (!event.added.size) return;
			event.added.forEach(sendMail);
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	});
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
}).done();
