'use strict';

var isReadOnlyRender = require('mano/client/utils/is-read-only-render');

exports.title = "eRegistrations: Prototype demo";

exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });

	if (isReadOnlyRender) {
		// SPA takeover
		script(function (appUrl) {
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
			document.write('<scr' + 'ipt async src="' + appUrl + '"></sc' + 'ript>');
		}, stUrl('prototype.js'));
	}

	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype-print.css'), rel: 'stylesheet' });
};

exports.body = function () {
	header(
		{ class: 'print-header' },
		img({ src: '/img/logo-2.png' }),
		div(
			{ id: 'print-page-title' }
		)
	);
	hr();
	section({ id: 'main' });
};
