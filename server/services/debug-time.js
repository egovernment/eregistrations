'use strict';

var debug = require('debug-ext')('health')

  , now = require('microtime-x');

debug.color = 5;

module.exports = exports = function () {
	debug("%sMB", (process.memoryUsage().rss / 1048576).toFixed(3));
};
exports();

setInterval(function () {
	console.log('');
	debug("%s %s %sMB", (new Date()).toISOString(), now(),
		(process.memoryUsage().rss / 1048576).toFixed(3));
}, 1000 * 60);
