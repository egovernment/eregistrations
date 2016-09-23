'use strict';

var ensureObject = require('es5-ext/object/valid-object');

var headers = {
	'Cache-Control': 'no-cache',
	'Content-Type': 'text/csv; charset=utf-8'
};

module.exports = function (controller) {
	if (typeof ensureObject(controller) === 'function') controller = { controller: controller };
	if (!controller.match) {
		// We expect url with '.csv' extension that requires hack as below
		controller.match = function () { return true; };
	}
	controller.headers = headers;
	return controller;
};
