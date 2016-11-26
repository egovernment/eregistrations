'use strict';

var main = require('mano-legacy');

try {
	Object.defineProperty(window, '$',
		{ configurable: false, enumerable: true, writable: false, value: main });
} catch (e) {
	window.$ = main;
}
