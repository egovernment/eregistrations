// Documents list and user data

'use strict';

var renderDocumentsList = require('./components/business-process-documents-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-documents'] = { class: { active: true } };
exports['official-revision-content'] = function () {
	return section(
		{ class: 'section-primary' },
		renderDocumentsList(this.businessProcess, { urlPrefix: '/' + this.businessProcess.__id__ + '/' }),
		div({ id: 'revision-document', class: 'business-process-revision-selected-document' })
	);
};
