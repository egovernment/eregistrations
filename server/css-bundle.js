'use strict';

var cssAid   = require('css-aid')
  , getFiles = require('./css-bundle-get-files');

module.exports = function (indexPath, readFile) {
	return getFiles(indexPath, readFile)(function (data) {
		return cssAid(data.reduce(function (content, data) {
			return content + '/* ' + data.filename + ' */\n\n' + data.content + '\n';
		}, '').slice(0, -1));
	});
};
