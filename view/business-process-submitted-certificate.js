// Single certificate submitted view

'use strict';

var db                    = require('mano').db
  , endsWith              = require('es5-ext/string/#/ends-with')
  , documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	documentView(doc,
		this.businessProcess.certificates.uploaded,
		[doc.dataForm.constructor !== db.FormSectionBase ?
				doc.dataForm.toDOM(document, {
					customFilter: function (resolved) {
						return !endsWith.call(resolved.observable.dbId, 'files/map');
					},
					disableHeader: false
				}) : null,
				doc.overviewSection.toDOM(document, { disableHeader: false }),
			renderDocumentHistory(doc)]
			);
};
