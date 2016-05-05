// Single document submitted view

'use strict';

var renderDocument             = require('./components/business-process-document')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , getDocumentData            = require('./utils/get-document-data');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);
	insert(
		renderDocument(this, documentData, {
			prependContent: renderDocumentRevisionInfo(this),
			mainContent: exports._documentPreviewContent.call(this, documentData),
			sideContent: renderDocumentHistory(documentData),
			documentsRootHref: '/'
		})
	);
};

exports._documentPreviewContent = Function.prototype;
