// Runs provided program and returns promise that resolves when it ends

'use strict';

var deferred = require('deferred')
  , fork     = require('child_process').fork;

module.exports = function (program/*, args, options*/) {
	var def = deferred();
	var child = fork.apply(null, arguments);
	child.on('exit', function () { def.resolve(); });
	child.on('error', def.reject);
	return def.promise;
};
