'use strict';

var spawn = require('child_process').spawn;

module.exports = function () {
	var child = spawn.apply(null, arguments), out = '';
	child.stdout.on('data', function (data) { out += data; });
	child.stderr.on('data', function (data) { out += data; });
	child.on('error', function (error) {
		console.log(out);
		throw error;
	});
	child.on('exit', function (code) {
		console.log(out);
		if (!code) return;
		process.exit(code);
	});
};
