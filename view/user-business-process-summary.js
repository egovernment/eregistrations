// User: Chosen business process main display

'use strict';

exports._parent = require('./user_requests');

exports['user-account-data'] = { class: { active: true } };
exports['user-requests-preview'] = function () {
	require('_business-process-documents-and-data-brief.js');
};
