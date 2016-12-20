// Inspector dedicated search query handler
// (used to handle processing steps table in inspector role)

'use strict';

module.exports = [
	require('../../apps-common/query-conf/business-process-status'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/registration'),
	require('../../apps-common/query-conf/submitter-type'),
	require('../../apps-common/query-conf/search'),
	require('../../apps-common/query-conf/page')
];
