// Whether app is dedicated for regular user (not official or administrator)

'use strict';

var ensureString = require('es5-ext/object/validate-stringifiable-value')
  , startsWith   = require('es5-ext/string/#/starts-with')
  , Set          = require('es6-set')

  , userApps = new Set(['manager', 'manager-registration', 'user']);

module.exports = function (appName) {
	appName = ensureString(appName);
	if (userApps.has(appName)) return true;
	return startsWith.call(appName, 'business-process-');
};
