// Replaces all require('mano').db with require to base db setup e.g. require('../../db');

'use strict';

var repeat        = require('es5-ext/string/#/repeat')
  , replaceAll    = require('es5-ext/string/#/plain-replace-all')
  , globalRewrite = require('../utils/global-rewrite');

module.exports = function (path) {
	return globalRewrite(path, function (content, path) {
		var nest = repeat.call('../', path.split('/').length - 1);
		return replaceAll.call(content, 'require(\'mano\').db',
			'require(\'' + (nest || './') + 'db\')');
	});
};
