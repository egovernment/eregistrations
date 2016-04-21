// Single certificate submitted view

'use strict';

var db                    = require('mano').db
  , endsWith              = require('es5-ext/string/#/ends-with')
  , documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history');

exports._parent  = require('./business-process-official-documents');
exports._dynamic = require('./utils/document-dynamic-matcher')('certificate');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	documentView(doc, this.processingStep.certificates.uploaded, {
		sideContent: [
			doc.overviewSection.toDOM(document, { disableHeader: false }),
			doc.dataForm.constructor !== db.FormSectionBase ? doc.dataForm.toDOM(document, {
				customFilter: function (resolved) {
					return !endsWith.call(resolved.observable.dbId, 'files/map');
				},
				disableHeader: false
			}) : null
		],
		appendContent: renderDocumentHistory(doc)
	});
};
