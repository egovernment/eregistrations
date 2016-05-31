// Single payment submitted view

'use strict';

var renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/render-sections-json')
  , getDocumentData            = require('./utils/get-document-data');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('receipt');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);

	insert(renderDocument(this, documentData, {
		prependContent: renderDocumentRevisionInfo(this),
		mainContent: exports._paymentPreviewContent.call(this, documentData),
		sideContent: renderSections(this.businessProcess.dataForms.dataSnapshot),
		urlPrefix: '/' + this.businessProcess.__id__ + '/'
	}),
		renderDocumentHistory(documentData)
		);
};

exports._paymentPreviewContent = Function.prototype;
