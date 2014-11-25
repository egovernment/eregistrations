'use strict';

var autoprefixer = require('autoprefixer-core')
  , cssAid       = require('css-aid/process')
  , cssAidRules  = [require('css-aid/rules/variables')]
  , getFiles     = require('./css-bundle-get-files');

module.exports = function (indexPath, readFile) {
	return getFiles(indexPath, readFile)(function (data) {
		return cssAid(autoprefixer.process(data.reduce(function (content, data) {
			return content + '/* ' + data.filename + ' */\n\n' + data.content + '\n';
		}, '').slice(0, -1)).css, cssAidRules);
	});
};
