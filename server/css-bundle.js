'use strict';

var path            = require('path')
  , common          = require('path2/common')
  , defaultReadFile = require('fs2/read-file')
  , cssAid          = require('css-aid')

  , dirname = path.dirname, resolve = path.resolve;

module.exports = function (indexPath, readFile) {
	var rootPath, indexDir;
	if (!readFile) readFile = defaultReadFile;
	indexPath = resolve(indexPath);
	indexDir = dirname(indexPath);
	return readFile(indexPath, 'utf8')(function (content) {
		var filenames = content.trim().split('\n').filter(Boolean).map(function (name) {
			return resolve(indexDir, name);
		});
		rootPath = common.apply(null, filenames);
		return filenames;
	}).map(function (filename) {
		return readFile(filename, 'utf8')(function (content) {
			return {
				filename: filename.slice(rootPath.length + 1),
				content: content
			};
		});
	})(function (data) {
		return cssAid(data.reduce(function (content, data) {
			return content + '/* ' + data.filename + ' */\n\n' + data.content + '\n';
		}, '').slice(0, -1));
	});
};
