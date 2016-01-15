'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , debug        = require('debug-ext')('setup')
  , resolve      = require('path').resolve
  , writeFile    = require('fs2/write-file')

  , stringify = JSON.stringify
  , writeOpts = { intermediate: true };

module.exports = function (env, root) {
	var content, clientEnv;
	ensureObject(env);
	root = ensureString(root);
	debug('generate-client-env');
	clientEnv = {
		static: { host: (env.static && env.static.host) || '/' },
		url: env.url,
		objectsListItemsPerPage: env.objectsListItemsPerPage,
		i18n: (env.i18n !== false)
	};
	if (env.googleAnalytics) clientEnv.googleAnalytics = env.googleAnalytics;
	content = '\'use strict\';\n\nmodule.exports = require(\'mano\').env = ' +
		stringify(clientEnv, null, '\t') + ';\n';
	return writeFile(resolve(root, 'apps-common/client/env.js'), content, writeOpts);
};
