'use strict';

var document, window;

try {
	document = require('jsdom').jsdom();
	window = document.defaultView;
} catch (ignore) {}

exports.context = document ? { document: document, window: window, process: process } : {};
