// Single document submitted view

'use strict';

var renderDocument = require('./_business-process-revision-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports['revision-box'] = function () {
	div({ class: 'business-process-revision-box-header' },
			ol({ class: 'submitted-documents-list' },
				li(this.document._label)),
			div({ class: 'business-process-revision-box-controls' },
				a({ href: '#', class: 'hint-optional hint-optional-left',
					'data-hint': _('Previous document') },
					i({ class: 'fa fa-angle-left' })),
				a({ href: '#', class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
					i({ class: 'fa fa-angle-right' }))
				));
};

exports['document-preview'] = function () {
	renderDocument(this.document);
};

exports['document-history'] = function () {
	renderDocumentHistory(this.document);
};
