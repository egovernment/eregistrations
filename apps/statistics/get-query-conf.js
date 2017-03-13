// Handles params parsing for all statistics queries
'use strict';

var aFrom              = require('es5-ext/array/from')
  , ensureArray        = require('es5-ext/array/valid-array');

var queryConf = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to')
];

module.exports = exports = function (data) {
	var conf = aFrom(queryConf);

	conf.push(
		require('../../apps-common/query-conf/service'),
		require('../../apps-common/query-conf/step')()
	);

	if (exports.customQueryConf) {
		ensureArray(exports.customQueryConf).forEach(function (confItem) {
			conf.push(confItem);
		});
	}

	return conf;
};
