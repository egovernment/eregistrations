// Single certificate submitted view

'use strict';

var _                     = require('mano').i18n
  , renderDocument        = require('./components/document-preview')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , renderSections        = require('./components/render-sections-json')
  , getDocumentData       = require('./utils/get-document-data');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('certificate');
exports._match   = 'documentUniqueId';

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this);

	if (documentData) {
		insert(renderDocument(this, documentData, {
			mainContent: exports._certificatePreviewContent.call(this, documentData),
			sideContent: [
				documentData.overviewSection,
				documentData.section,
				renderSections(this.businessProcess.dataForms.dataSnapshot)
			],
			urlPrefix: '/' + this.businessProcess.__id__ + '/'
		}), renderDocumentHistory(documentData));
	} else {
		insert(section({ class: 'section-secondary' }, p(_("No data to display"))));
	}
};

exports._certificatePreviewContent = Function.prototype;
