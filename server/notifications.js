'use strict';

var assign         = require('es5-ext/object/assign')
  , isObject       = require('es5-ext/object/is-object')
  , compileTpl     = require('es6-template-strings/compile')
  , resolveTpl     = require('es6-template-strings/resolve-to-string')
  , deferred       = require('deferred')
  , memoize        = require('memoizee')
  , delay          = require('timers-ext/delay')
  , readFile       = require('fs').readFileSync
  , path           = require('path')
  , readdir        = require('fs2/readdir')
  , urlParse       = require('url').parse
  , mano           = require('mano')
  , resolveTrigger = require('./_resolve-trigger')
  , users          = require('../users')

  , basename = path.basename, dirname = path.dirname, resolve = path.resolve
  , defaults = mano.mail.config
  , defContext = { url: mano.env.url, domain: mano.env.url && urlParse(mano.env.url).host }
  , setup, getFrom, getTo, getCc, getAttachments;

getFrom = function (user, from) {
	if (from == null) return defaults.from;
	if (typeof from === 'function') return from(user);
	return from;
};

getTo = function (user, to) {
	if (to != null) {
		if (typeof to === 'function') return to(user);
		return to;
	}
	if (user.email) return user.email;
	if (user.manager) return user.manager.email;
};

getCc = function (user, cc) {
	if (cc != null) {
		if (typeof cc === 'function') return cc(user);
		return cc;
	}
	if (user.email && user.manager) return user.manager.email;
};

getAttachments = function (user, att) {
	if (att == null) return [];
	if (typeof att === 'function') {
		return att(user);
	}
	return [];
};

setup = function (path) {
	var dir = dirname(path), name = basename(path, '.js')
	  , conf = require(path), subject, text, getText, set, getTemplate
	  , sendMail, context = assign({}, defContext);

	if (conf.variables) assign(context, conf.variables);
	set = resolveTrigger(conf.trigger, conf.triggerValue);

	subject = compileTpl(conf.subject);

	if (conf.text == null) {
		text = compileTpl(readFile(resolve(dir, name + '.txt')));
	} else if (typeof conf.text === 'function') {
		getTemplate = memoize(function (path) {
			return compileTpl(readFile(resolve(dir, path + '.txt')));
		});
		getText = function (user) {
			return resolveTpl(getTemplate(conf.text(user, context)), context);
		};
	} else {
		text = compileTpl(conf.text);
	}

	if (!getText) {
		getText = function () { return resolveTpl(text, context); };
	}

	sendMail = delay(function (user) {
		var text, mailOpts, to = getTo(user, conf.to);
		if (!to) {
			console.error("No email provided for " + user.fullName + " [" + user.__id__ + "]");
			return;
		}
		context.user = user;
		text = getText(user);
		mailOpts = {
			from: getFrom(user, conf.from),
			to: to,
			cc: getCc(user, conf.cc),
			subject: resolveTpl(subject, context),
			attachments: getAttachments(user, conf.attachments)
		};
		mailOpts.text = text;
		context.user = null;
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
