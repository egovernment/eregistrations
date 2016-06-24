// Extensions to basic domjs functions

'use strict';

var assign           = require('es5-ext/object/assign')
  , callable         = require('es5-ext/object/valid-callable')
  , isObservable     = require('observable-value/is-observable-value')
  , elementExt       = require('domjs/ext/_element')
  , mano             = require('mano')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')

  , mdiOptions = { inline: true };

assign(elementExt, {
	addClass: require('dbjs-dom/ext/element/add-class'),
	removeClass: require('dbjs-dom/ext/element/remove-class')
});

module.exports = function (domjs) {
	var RelValue, ns = domjs.ns, md, mdToDom;

	// Elements
	require('domjs-ext/_if')(domjs);
	require('domjs-ext/and')(domjs);
	ns.browser = function (cb) {
		if (isReadOnlyRender) return;
		callable(cb);
		if (typeof window === 'undefined') return;
		cb();
	};

	require('domjs-ext/eq')(domjs);
	require('domjs-ext/eq-sloppy')(domjs);
	require('domjs-ext/eq-some')(domjs);
	require('domjs-ext/gt')(domjs);
	require('domjs-ext/gt-or-eq')(domjs);
	require('domjs-ext/html')(domjs);
	require('domjs-ext/list')(domjs);
	require('domjs-ext/lt')(domjs);
	require('domjs-ext/lt-or-eq')(domjs);
	mdToDom = require('i18n2-md-to-dom')(domjs.document);
	md = ns.md = function (message/*, options*/) {
		var options = arguments[1];
		if (!isObservable(message)) {
			if (message == null) return message;
			return mdToDom(message, options);
		}
		return message.map(function (message) {
			if (message == null) return message;
			return mdToDom(message, options);
		});
	};
	ns.mdi = function (message) { return md(message, mdiOptions); };
	require('domjs-ext/mmap')(domjs);
	require('domjs-ext/modal')(domjs);
	require('domjs-ext/not')(domjs);
	require('domjs-ext/or')(domjs);
	require('domjs-ext/post-button')(domjs);
	require('domjs-ext/resolve')(domjs);
	ns.stUrl = function (path) {
		if (path[0] === '/') path = path.slice(1);
		return mano.env.static.host + path;
	};
	require('domjs-reactive-script')(domjs);
	require('domjs-ext/legacy')(domjs);
	require('./disabler')(domjs);
	require('./thumb')(domjs);
	require('domjs-ext/upload-button')(domjs);
	require('domjs-ext/url')(domjs);

	// Directives
	if (!isReadOnlyRender) {
		require('domjs-ext/d/fixed')(domjs);
		require('domjs-ext/d/form/auto-submit')(domjs);
		require('../directives/img-zoom-on-hover')(domjs);
		require('../directives/table-responsive')(domjs);
	}
	require('../directives/table-configuration')(domjs);

	// extensions
	require('domjs-ext/ext/_element/toggle');

	// Dbjs extensions
	RelValue = require('dbjs-dom/text/utils/rel-value');
	RelValue.prototype.domjs = domjs;
	require('dbjs-dom/ext/domjs/rel-value');
	require('dbjs-domjs')(domjs);

	return domjs;
};
