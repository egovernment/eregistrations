// Single document submitted view

'use strict';

var renderDocument = require('./_business-process-submitted-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-official-documents');
exports._match = 'document';

exports['selection-preview'] = function () {
	return [div({ id: 'submitted-box', class: 'business-process-submitted-box' },
		div({ class: 'business-process-submitted-box-header' },
			ol({ class: 'submitted-documents-list' },
				li(this.document._label,
					a({ class: 'hint-optional hint-optional-right', 'data-hint': _('Open in new tab'),
						href: this.document.docUrl, target: '_blank' },
						i({ class: 'fa fa-external-link' })))),
			div({ class: 'business-process-submitted-box-controls' },
				a({ href: '#', class: 'hint-optional hint-optional-left',
					'data-hint': _('Previous document') },
					i({ class: 'fa fa-angle-left' })),
				a({ href: '#', class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
					i({ class: 'fa fa-angle-right' }))
				))),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },
				div({ id: 'document-preview', class: 'submitted-preview-document' },
					renderDocument(this.document)),
				div({ id: 'document-history', class: 'submitted-preview-document-history' },
					renderDocumentHistory(this.document))))];
};
