'use strict';

var microtime = require('microtime-x');

module.exports = function () {
	return { 'time-sync': function () { return microtime(); } };
};
