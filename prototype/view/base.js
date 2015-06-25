'use strict';

var isReadOnlyRender = require('mano/client/utils/is-read-only-render');

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
	link({ href: stUrl('prototype.css'), rel: 'stylesheet' });
};
