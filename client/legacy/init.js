'use strict';

var main = module.exports = require('mano-legacy'), sources, i;

main.$eregLegacy = true;

try {
	Object.defineProperty(window, '$',
		{ configurable: false, enumerable: true, writable: false, value: main });
} catch (e) {
	try {
		window.$ = main;
	} catch (e2) {
		if (!window.$.$eregLegacy) {
			sources = '';
			if (document.scripts) {
				sources = '\n\nScripts length: ' + document.scripts.length + '\n';
				for (i = 0; i < document.scripts.length; ++i) {
					sources += document.scripts[i].src + '\n';
				}
			}
			throw new Error("'$' is overriden, cannot setup legacy" + sources);
		}
	}
}
