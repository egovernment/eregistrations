// Single document submitted view

'use strict';

var _                          = require('mano').i18n
  , renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/business-process-document-render-sections')
  , getDocumentData            = require('./utils/get-document-data')
  , dynamicMatcher             = require('./utils/document-dynamic-matcher')('document');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = function (doc) {
	return this.document ? dynamicMatcher(doc) : {};
};
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData;

	if (this.document) {
		documentData = getDocumentData(this);

		insert(renderDocument(this, documentData, {
			prependContent: renderDocumentRevisionInfo(documentData, this.documentKind),
			mainContent: exports._documentPreviewContent.call(this, documentData),
			sideContent: exports._renderSections.call(this),
			urlPrefix: '/' + this.businessProcess.__id__ + '/',
			documentsRootHref:
				document.getElementById('tab-business-process-documents').getAttribute('href')
		}), renderDocumentHistory(documentData));
	} else {
		insert(section({ class: 'section-secondary' },
			p({ class: 'info-main' }, _("No data to display"))));
	}
};

exports._documentPreviewContent = Function.prototype;

exports._renderSections = renderSections;
