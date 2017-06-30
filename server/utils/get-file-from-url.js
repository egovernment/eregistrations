'use strict';

var request = require('request')
  , deferred = require('deferred')
  , fs = require('fs')
  , path = require('path')
  , envUploadsDir = require('mano').uploadsPath;

module.exports = function (url, destPath) {
	var def = deferred()
  , write = fs.createWriteStream(path.resolve(envUploadsDir, destPath));
	write.on('error', def.reject);
	request.get(url).on('error', function (err) {
		def.reject(err);
	}).pipe(write);
	write.on('close', def.resolve);
	return def.promise;
};
