// Single document submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , documentRevisionInfo  = require('./components/business-process-document-review-info');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	insert(documentView(doc, this.processingStep.requirementUploads.applicable, {
		prependContent: documentRevisionInfo(doc),
		sideContent: renderDocumentHistory(doc),
		urlPrefix: '/' + this.businessProcess.__id__ + '/'
	}));
};
