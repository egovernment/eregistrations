// Single document submitted view

'use strict';

var camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

exports['selection-preview'] = function () {
	var doc = this.document;

	documentView(doc, this.businessProcess.requirementUploads.applicable, renderDocumentHistory(doc));
};
