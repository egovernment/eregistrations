// Single payment submitted view

'use strict';

var documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history');

exports._parent  = require('./business-process-submitted-documents');
exports._dynamic = require('./utils/document-dynamic-matcher');
exports._match   = 'document';

exports['selection-preview'] = function () {
	var doc = this.document;

	documentView(doc, this.businessProcess.paymentReceiptUploads.applicable,
		renderDocumentHistory(doc));
};
