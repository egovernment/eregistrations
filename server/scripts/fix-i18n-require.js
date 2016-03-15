// Replaces all require('mano').i18n with require to base i18n setup e.g. require('../../i18n')

'use strict';

var repeat        = require('es5-ext/string/#/repeat')
  , replaceAll    = require('es5-ext/string/#/plain-replace-all')
  , globalRewrite = require('../utils/global-rewrite');

module.exports = function (path) {
	return globalRewrite(path, function (content, path) {
		var nest;
		if (path === 'i18n.js') return;
		nest = repeat.call('../', path.split('/').length - 1);
		content = replaceAll.call(content, 'require(\'mano\').i18n',
			'require(\'' + (nest || './') + 'i18n\')');
		return replaceAll.call(content, 'mano.i18n',
			'require(\'' + (nest || './') + 'i18n\')');
	});
};
