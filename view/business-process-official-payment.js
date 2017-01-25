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
	var documentData    = getDocumentData(this)
	  , businessProcess = this.businessProcess;

	insert(renderDocument(this, documentData, {
		prependContent: renderDocumentRevisionInfo(documentData, this.documentKind),
		mainContent: exports._paymentPreviewContent.call(this, documentData),
		sideContent: exports._renderSections.call(this),
		urlPrefix: '/' + businessProcess.__id__ + '/'
	}), renderDocumentHistory(documentData));
};

exports._paymentPreviewContent = Function.prototype;

exports._renderSections = function () {
	var businessProcess = this.businessProcess
	  , dataSnapshot    = businessProcess.dataForms.dataSnapshot;

	return dataSnapshot.resolved ? renderSections(dataSnapshot) :
			list(businessProcess.dataForms.applicable, function (section) {
				return section.toDOM(document);
			});
};
