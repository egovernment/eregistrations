// User: Chosen business process main display

'use strict';

exports._parent = require('./user-requests');

exports['user-account-data'] = { class: { active: true } };
exports['user-requests-preview'] = function () {
	insert(require('./components/business-process-documents-and-data-brief')(this));
};
