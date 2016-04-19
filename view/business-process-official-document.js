// Single document submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher');
exports._match   = 'document';

exports['selection-preview'] = function () {
	documentView(this.document,
		this.businessProcess.requirementUploads.applicable,
		renderDocumentHistory(this.document));
};
