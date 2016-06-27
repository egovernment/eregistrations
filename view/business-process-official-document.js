// Single document submitted view

'use strict';

var renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/render-sections-json')
  , getDocumentData            = require('./utils/get-document-data');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('document');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);

	insert(renderDocument(this, documentData, {
		prependContent: renderDocumentRevisionInfo(this),
		mainContent: exports._documentPreviewContent.call(this, documentData),
		sideContent: exports._renderSections.call(this),
		urlPrefix: '/' + this.businessProcess.__id__ + '/',
		documentsRootHref:
			document.getElementById('tab-business-process-documents').getAttribute('href')
	}),
		renderDocumentHistory(documentData)
		);
};

exports._documentPreviewContent = Function.prototype;

exports._renderSections = function () {
	var businessProcess = this.businessProcess, requirementUpload = this.document.owner;

	return _if(requirementUpload.sections, function () {
		return list(requirementUpload.sections, function (section) { return section.toDOM(document); });
	}, function () {
		return renderSections(businessProcess.dataForms.dataSnapshot);
	});
};
