// Documents list and user data

'use strict';

var renderDocumentsList = require('./components/business-process-documents-list');

exports._parent = require('./business-process-revision');

exports['tab-business-process-documents'] = { class: { active: true } };
exports['tab-content'] = function () {
	return section({ class: 'section-primary' },
		div({ class: "section-primary-sub" }, div(renderDocumentsList(this, {
			urlPrefix: '/' + this.businessProcess.__id__ + '/',
			documentsRootHref: '/' + this.businessProcess.__id__ + '/documents/'
		}))),
		div({ id: 'selection-preview' }));
};
