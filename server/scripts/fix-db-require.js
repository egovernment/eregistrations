// Replaces all require('mano').db with require to base db setup e.g. require('../../db');

'use strict';

var repeat        = require('es5-ext/string/#/repeat')
  , globalRewrite = require('../utils/global-rewrite')

  , re1 = /require\('mano'\)\.db(?!D)/g
  , re2 = /mano\.db(?!D)/g;

module.exports = function (path) {
	return globalRewrite(path, function (content, path) {
		var nest, replaceString;
		if (path === 'db.js') return;
		nest = repeat.call('../', path.split('/').length - 1);
		replaceString = 'require(\'' + (nest || './') + 'db\')';
		return content.replace(re1, replaceString).replace(re2, replaceString);
	});
};
