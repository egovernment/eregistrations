'use strict';

var normalizeOpts = require('es5-ext/object/normalize-options')
  , getFiles      = require('./css-bundle-get-files');

var pathProxy = function (path) { return path.replace('/css/', '/css/legacy/'); };

module.exports = function (indexPath/*, options */) {
	var options = normalizeOpts(arguments[1]);
	options.loose = true;
	options.pathProxy = pathProxy;
	return getFiles(indexPath, options)(function (data) {
		return data.reduce(function (content, data) {
			return content + '/* ' + data.filename + ' */\n\n' + data.content + '\n';
		}, '').slice(0, -1);
	});
};
