// Replaces all require('mano').i18n with require to base i18n setup e.g. require('../../i18n')

'use strict';

var repeat        = require('es5-ext/string/#/repeat')
  , globalRewrite = require('../utils/global-rewrite')

  , re1 = /require\('mano'\)\.i18n(?!S)/g
  , re2 = /mano\.i18n(?!S)/g;

module.exports = function (path) {
	return globalRewrite(path, function (content, path) {
		var nest, replaceString;
		if (path === 'i18n.js') return;
		nest = repeat.call('../', path.split('/').length - 1);
		replaceString = 'require(\'' + (nest || './') + 'db\')';
		return content.replace(re1, replaceString).replace(re2, replaceString);
	});
};
