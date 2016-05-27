// Single certificate submitted view

'use strict';

var renderDocument        = require('./components/document-preview')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , renderSections        = require('./components/render-sections-json')
  , getDocumentData       = require('./utils/get-document-data');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('certificate');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);
	console.log('renderDocumentHistory(documentData)', renderDocumentHistory(documentData));
	insert(renderDocument(this, documentData, {
		mainContent: exports._certificatePreviewContent.call(this, documentData),
		sideContent: [
			documentData.overviewSection,
			documentData.section,
			renderSections(this.businessProcess.dataForms.dataSnapshot)
		]
	}),
		renderDocumentHistory(documentData)
		);
};

exports._certificatePreviewContent = Function.prototype;
