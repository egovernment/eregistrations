'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value')
  , getDebug     = require('debug-ext')
  , now          = require('microtime-x');

module.exports = function (ns) {
	var debug = getDebug('health:' + ensureString(ns));

	debug.color = 5;

	debug("%sMB\n", (process.memoryUsage().rss / 1048576).toFixed(3));

	setInterval(function () {
		debug("%s %s %sMB\n", (new Date()).toISOString(), now(),
			(process.memoryUsage().rss / 1048576).toFixed(3));
	}, 1000 * 60);
};
