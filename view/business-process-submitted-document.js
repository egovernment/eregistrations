// Single document submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , documentRevisionInfo  = require('./components/business-process-document-review-info');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	insert(documentView(doc, this.businessProcess.requirementUploads.applicable, {
		mainContent: exports._documentPreviewContent.call(this),
		sideContent: renderDocumentHistory(doc)
	}), documentRevisionInfo(doc));
};

exports._documentPreviewContent = Function.prototype;
