'use strict';

var aFrom              = require('es5-ext/array/from')
  , ensureArray        = require('es5-ext/array/valid-array')
  , normalizeOptions   = require('es5-ext/object/normalize-options')

  , stringify          = JSON.stringify;

var queryConf = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to')
];

module.exports = exports = function (data) {
	var options = normalizeOptions(data)
	  , processingStepsMeta = options.processingStepsMeta
	  , conf = aFrom(queryConf);

	conf.push(
		require('../../apps-common/query-conf/service'),
		{
			name: 'step',
			ensure: function (value) {
				if (!value) return;
				if (!processingStepsMeta[value]) {
					throw new Error("Unrecognized step value " + stringify(value));
				}
				return value;
			}
		}
	);

	if (exports.customQueryConf) {
		ensureArray(exports.customQueryConf).forEach(function (confItem) {
			conf.push(confItem);
		});
	}

	return conf;
};
