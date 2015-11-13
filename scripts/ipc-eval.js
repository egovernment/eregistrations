'use strict';

var punt     = require('punt')
  , readFile = require('fs2/read-file');

module.exports = function (filename) {
	var port = require('mano').env.port;
	if (!port) throw new Error("No IPC port configured");
	readFile(filename).done(function (data) {
		var client = punt.connect('0.0.0.0:' + port);
		client.send('message', String(data), function (err) {
			if (err) throw err;
			client.sock.close();
		});
	});
};
