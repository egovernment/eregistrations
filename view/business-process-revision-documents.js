// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-documents-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-documents'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , selectedDocumentId = this.document ?  this.document.__id__ : null;

	options.documentsTarget = businessProcess;
	options.urlPrefix = urlPrefix;
	options.selectedDocumentId = selectedDocumentId;

	return [section({ class: 'section-primary' },
			renderDocumentsList(this, options),
			div({ id: 'revision-document', class: 'business-process-revision-selected-document' })
		)];
};
