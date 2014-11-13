// Extensions to basic domjs functions

'use strict';

var assign     = require('es5-ext/object/assign')
  , callable   = require('es5-ext/object/valid-callable')
  , elementExt = require('domjs/ext/_element')
  , mano       = require('mano');

assign(elementExt, {
	addClass: require('dbjs-dom/ext/element/add-class'),
	removeClass: require('dbjs-dom/ext/element/remove-class')
});

module.exports = function (domjs) {
	var RelValue, ns = domjs.ns;

	// Elements
	require('domjs-ext/_if')(domjs);
	require('domjs-ext/and')(domjs);
	ns.browser = function (cb) {
		callable(cb);
		if (typeof window === 'undefined') return;
		cb();
	};

	require('domjs-ext/eq')(domjs);
	require('domjs-ext/eq-some')(domjs);
	require('domjs-ext/gt')(domjs);
	require('domjs-ext/gt-or-eq')(domjs);
	require('domjs-ext/html')(domjs);
	require('domjs-ext/legacy')(domjs);
	require('domjs-ext/list')(domjs);
	require('domjs-ext/lt')(domjs);
	require('domjs-ext/lt-or-eq')(domjs);
	ns.md = require('i18n2-md-to-dom')(domjs.document);
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
	require('./thumb')(domjs);
	require('domjs-ext/upload-button')(domjs);
	require('domjs-ext/url')(domjs);

	// Directives
	require('domjs-ext/d/fixed')(domjs);
	require('domjs-ext/d/form/auto-submit')(domjs);
	require('../directives/responsive-table')(domjs);

	// DBJS extensions
	RelValue = require('dbjs-dom/text/utils/rel-value');
	RelValue.prototype.domjs = domjs;
	require('dbjs-dom/ext/domjs/rel-value');
	require('dbjs-domjs')(domjs);

	return domjs;
};
