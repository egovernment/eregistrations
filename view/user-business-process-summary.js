// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary');

exports._parent = require('./user_requests');

exports['user-account-data'] = { class: { active: true } };
exports['user-requests-preview'] = function () {
	require('_business-process-documents-and-data-brief.js');
};
