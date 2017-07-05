'use strict';

var request = require('request')
  , deferred = require('deferred')
  , fs = require('fs')
  , path = require('path')
  , db = require('../../db')
  , File = require('eregistrations/model/file')(db)
  , envUploadsDir = require('mano').uploadsPath;

// destPath - path to save without extenstion
module.exports = function (url, destPath) {
	var def = deferred();
	request.get(url).on('error', def.reject).on('response', function (res) {
		var mime = res.headers['content-type'], write;
		if (res.statusCode < 200 || res.statusCode > 299) {
			def.reject();
			return;
		}
		if (!File.accept.has(mime)) {
			def.reject();
			return;
		}
		write = fs.createWriteStream(path.resolve(envUploadsDir, destPath + '.' + mime.split('/')[1]));
		write.on('close', function () {
			def.resolve(mime);
		});
		write.on('error', def.reject);
		res.pipe(write);
	});
	return def.promise;
};
