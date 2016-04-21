// Single payment submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , documentRevisionInfo  = require('./components/business-process-document-review-info');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('receipt');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	insert([documentView(doc, this.processingStep.requirementUploads.applicable, {
		sideContent: renderDocumentHistory(doc)
	}), documentRevisionInfo(doc)]);
};
