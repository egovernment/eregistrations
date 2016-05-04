// Documents list and user data

'use strict';

var renderDocumentsList = require('./components/business-process-documents-list');

exports._parent = require('./business-process-revision');

exports['tab-business-process-documents'] = { class: { active: true } };
exports['tab-content'] = function () {
	var options = { urlPrefix: '/' + this.businessProcess.__id__ + '/' };

	return section({ class: 'section-primary' },
		div({ class: "section-primary-sub" }, div(renderDocumentsList(this, options))),
		div({ id: 'selection-preview' }));
};
