// Single document revision view

'use strict';

var renderDocument = require('./_business-process-revision-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports['document-preview'] = function () {
	renderDocument(this.document);
};

exports['document-history'] = function () {
	renderDocumentHistory(this.document);
};
