// Single certificate submitted view

'use strict';

var documentView = require('./components/business-process-document')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , db                 = require('mano').db;

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

exports['selection-preview'] = function () {
	documentView(this.document,
		this.businessProcess.requirementUploads.applicable,
		[div({ class: 'submitted-preview-user-data  entity-data-section-side' },
						this.document.dataForm.constructor !== db.FormSectionBase ?
						this.document.dataForm.toDOM(document, {
						customFilter: function (resolved) {
							return !endsWith.call(resolved.observable.dbId, 'files/map');
						},
						disableHeader: false
					}) : null,
					this.document.overviewSection.toDOM(document, { disableHeader: false })
					),
				div({ class: 'submitted-preview-user-data  entity-data-section-side' },
					renderDocumentHistory(this.document))]);
};
