// Single document submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , documentRevsionInfo   = require('./components/business-process-document-review-info');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	documentView(doc, this.businessProcess.requirementUploads.applicable, {
		appendContent: documentRevsionInfo(doc),
		sideContent: renderDocumentHistory(doc)
	});
};
