// Configuration of dynamic inserts, that can be used in HTML markup as ${ nameOfInsert }

'use strict';

var mano            = require('mano')
  , location         = require('mano/lib/client/location')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')

  , db = mano.db;

// i18n translations
exports._ = require('mano').i18n.bind('Public');

// Returns root path for static files
exports.stRoot = stUrl('');

// SPA take over handler
if (isReadOnlyRender) {
	exports.spaTakeOver = script(function (appUrl) {
		var isStrict;
		if (typeof Object.getPrototypeOf !== 'function') return;
		if (typeof Object.defineProperty !== 'function') return;
		if (!window.history) return;
		isStrict = !(function () { return this; }());
		if (!isStrict) return;
		if (Object.getPrototypeOf({ __proto__: Function.prototype }) !== Function.prototype) return;
		if (Object.defineProperty({}, 'foo',  { get: function () { return 'bar'; } }).foo !== 'bar') {
			return;
		}
		if (document.cookie.indexOf('legacy=1') !== -1) return;
		document.write('<scr' + 'ipt defer src="' + appUrl + '"></sc' + 'ript>');
	}, stUrl('public.js'));
} else {
	exports.spaTakeOver = null;
}

exports.title = require('../../../view/base').title;

exports.passwordPattern = db.Password.pattern.source.slice(1, -1);
exports.passwordFormatHint = db.User.prototype.$password.inputHint;

exports.resetPasswordToken = location.query.get('token');
