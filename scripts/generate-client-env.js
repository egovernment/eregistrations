'use strict';

var debug     = require('debug-ext')('setup')
  , writeFile = require('fs2/write-file')

  , stringify = JSON.stringify
  , writeOpts = { intermediate: true };

module.exports = function (env, path) {
	var content, clientEnv;
	debug('generate-client-env');
	clientEnv = {
		static: { host: (env.static && env.static.host) || '/' },
		url: env.url,
		i18n: (env.i18n !== false)
	};
	if (env.googleAnalytics) clientEnv.googleAnalytics = env.googleAnalytics;
	content = '\'use strict\';\n\nmodule.exports = require(\'mano\').env = ' +
		stringify(clientEnv, null, '\t') + ';\n';
	return writeFile(path, content, writeOpts);
};
