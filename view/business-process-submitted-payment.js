// Single payment submitted view

'use strict';

var renderDocument             = require('./components/business-process-document')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , getDocumentData            = require('./utils/get-document-data');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('receipt');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);
	insert(
		renderDocument(this, documentData, {
			mainContent: exports._paymentPreviewContent.call(this, documentData),
			sideContent: renderDocumentHistory(documentData)
		}),
		renderDocumentRevisionInfo(this)
	);
};

exports._paymentPreviewContent = Function.prototype;
