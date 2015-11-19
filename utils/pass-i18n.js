// Resolve wether we want to apply translastions or not
// In browser we can force to enable/disable locale via i18n=0 or i18n=1 query in url
// or in any environment via i18n: true|false in env.json. otherwise locale is always loaded

'use strict';

var ensureObject = require('es5-ext/object/ensure-object')
  , re           = /(?:\?|&)i18n=(0|1)(?:&|$)/;

module.exports = function (env, locale) {
	var urlInstruction;
	(ensureObject(env) && ensureObject(locale));
	if ((typeof location === 'object') && location && (typeof location.search === 'string')) {
		urlInstruction = location.search.match(re);
		if (urlInstruction) return (urlInstruction[1] === '0') ? null : locale;
	}
	return (env.i18n === false) ? null : locale;
};
