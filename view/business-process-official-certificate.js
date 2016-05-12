// Single certificate submitted view

'use strict';

var renderDocument        = require('./components/business-process-document-preview')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , getDocumentData       = require('./utils/get-document-data');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('certificate');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);

	insert(renderDocument(this, documentData, {
		mainContent: exports._certificatePreviewContent.call(this, documentData),
		sideContent: [
			documentData.overviewSection,
			documentData.section,
			renderDocumentHistory(documentData)
		],
		urlPrefix: '/' + this.businessProcess.__id__ + '/'
	}));
};

exports._certificatePreviewContent = Function.prototype;
