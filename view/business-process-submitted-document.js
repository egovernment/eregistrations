// Single document submitted view

'use strict';

var renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/render-sections-json')
  , getDocumentData            = require('./utils/get-document-data');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);
	insert(
		renderDocument(this, documentData, {
			prependContent: renderDocumentRevisionInfo(documentData, this.documentKind),
			mainContent: exports._documentPreviewContent.call(this, documentData),
			sideContent: renderSections(this.businessProcess.dataForms.dataSnapshot),
			documentsRootHref: '/'
		}),
		renderDocumentHistory(documentData)
	);
};

exports._documentPreviewContent = Function.prototype;
