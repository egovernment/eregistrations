// Single document submitted view

'use strict';

var renderDocument             = require('./components/business-process-document')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	insert(renderDocument(this, this.businessProcess.requirementUploads.applicable, {
		mainContent: exports._documentPreviewContent.call(this),
		sideContent: renderDocumentHistory(this.document)
	}), renderDocumentRevisionInfo(this.document));
};

exports._documentPreviewContent = Function.prototype;
