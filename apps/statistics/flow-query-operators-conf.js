'use strict';

var processingSteps = require('../../processing-steps-meta');

module.exports = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/mode'),
	require('../../apps-common/query-conf/step')({ defaultStep: Object.keys(processingSteps)[0] }),
	require('../../apps-common/query-conf/page'),
	require('../../apps-common/query-conf/certificate'),
	{
		name: 'processor',
		ensure: function (value) {
			if (!value) return;
			// TODO: add user some validation after this is addressed
			// https://github.com/egovernment/eregistrations/issues/1641

			return value;
		}
	}
];
