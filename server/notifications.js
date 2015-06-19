'use strict';

var assign        = require('es5-ext/object/assign')
  , compileTpl    = require('es6-template-strings/compile')
  , resolveTpl    = require('es6-template-strings/resolve-to-string')
  , deferred      = require('deferred')
  , memoize       = require('memoizee')
  , delay         = require('timers-ext/delay')
  , readFile      = require('fs').readFileSync
  , path          = require('path')
  , readdir       = require('fs2/readdir')
  , urlParse      = require('url').parse
  , mano          = require('mano')
  , setupTriggers = require('./_setup-triggers')

  , create = Object.create
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
	if (user.user) return user.user.email; // Fix in case of businessProcesses
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
	  , conf = require(path), subject, resolvedText, getText, getTemplate
	  , context = assign({}, defContext);

	if (conf.variables) assign(context, conf.variables);

	subject = compileTpl(conf.subject);

	if (conf.text == null) {
		resolvedText = compileTpl(readFile(resolve(dir, name + '.txt')));
	} else if (typeof conf.text === 'function') {
		if (!conf.textResolvesTemplate) {
			getTemplate = memoize(function (path) {
				return compileTpl(readFile(resolve(dir, path + '.txt')));
			});
		}
		getText = function (user) {
			var data = conf.text(user, context);
			if (!conf.textResolvesTemplate) data = getTemplate(data);
			else data = compileTpl(data);
			return resolveTpl(data, context);
		};
	} else {
		resolvedText = compileTpl(conf.text);
	}

	setupTriggers(conf, delay(function (user) {
		var text, mailOpts, to = getTo(user, conf.to), prop, localContext;
		if (!to) {
			console.error("No email provided for " + user.fullName + " [" + user.__id__ + "]");
			return;
		}
		localContext = create(context);
		localContext.user = localContext.businessProcess = user;
		if (!getText) {
			if (conf.resolveGetters) {
				for (prop in localContext) {
					if (typeof localContext[prop] === 'function') localContext[prop] = localContext[prop]();
				}
			}
			getText = function () { return resolveTpl(resolvedText, localContext); };
		}
		try { text = getText(user); } catch (e) {
			console.log("Error: Resolution of notification crashed\n\tpath: " + path);
			if (mano.env && mano.env.dev) throw e;
			console.error("Cannot generate email message!:\n" + e.stack);
			return;
		}
		mailOpts = {
			from: getFrom(user, conf.from),
			to: to,
			cc: getCc(user, conf.cc),
			subject: resolveTpl(subject, localContext),
			attachments: getAttachments(user, conf.attachments)
		};
		mailOpts.text = text;
		mano.mail(mailOpts).done(null, function (err) {
			console.log("Cannot send email", err.stack);
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
}).done();
