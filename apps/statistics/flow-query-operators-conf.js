'use strict';

module.exports = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/mode'),
	require('../../apps-common/query-conf/step')({ defaultStep: 'revision' }),
	require('../../apps-common/query-conf/page'),
	{
		name: 'processor',
		ensure: function (value) {
			if (!value) return;

			return value;
		}
	}
];
