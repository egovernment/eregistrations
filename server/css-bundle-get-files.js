'use strict';

var compact         = require('es5-ext/array/#/compact')
  , callable        = require('es5-ext/object/valid-callable')
  , path            = require('path')
  , common          = require('path2/common')
  , defaultReadFile = require('fs2/read-file')

  , dirname = path.dirname, resolve = path.resolve;

module.exports = function (indexPath/*, options */) {
	var rootPath, indexDir, options = Object(arguments[1])
	  , readFile = options.readFile || defaultReadFile
	  , pathProxy = options.pathProxy;
	indexPath = resolve(indexPath);
	indexDir = dirname(indexPath);
	if (pathProxy !== undefined) callable(pathProxy);
	return readFile(indexPath, 'utf8')(function (content) {
		var filenames = content.trim().split('\n').filter(Boolean).map(function (name) {
			var filename = resolve(indexDir, name);
			if (pathProxy) filename = pathProxy(filename);
			return filename;
		});
		rootPath = common.apply(null, filenames);
		return filenames;
	}).map(function (filename) {
		return readFile(filename, { loose: options.loose, encoding: 'utf8' })(function (content) {
			if (content == null) return null;
			return {
				filename: filename.slice(rootPath.length + 1),
				content: content
			};
		}, function (e) {
			if (e.code !== 'ENOENT') throw e;
			throw new TypeError("Bad paths in " + indexPath + " -> " + e.message);
		});
	}).invoke(compact);
};
