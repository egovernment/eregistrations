// Single payment submitted view

'use strict';

var renderDocument = require('./_business-process-submitted-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')
  , getPrevNext = require('../utils/get-prev-next-set')
  , _                = require('mano').i18n.bind('User Submitted');

exports._parent = require('./business-process-submitted-documents');
exports._match = 'document';

exports['selection-preview'] = function () {
	var currentDoc = this.document.owner
	  , bp = this.document.master
	  , prevNextPair, prevDoc, nextDoc
	  , docSet;

	var urlPrefix = '/' + bp.__id__;

	docSet = bp.requirementUploads.applicable.or(bp.certificates.applicable);

	prevNextPair = getPrevNext(docSet, currentDoc);
	// because diff type of objects in the set
	prevDoc = prevNextPair.prev || undefined;
	prevDoc = (prevDoc && prevDoc.document) ? prevDoc.document : prevDoc;
	// because diff type of objects in the set
	nextDoc = prevNextPair.next || undefined;
	nextDoc = (nextDoc && nextDoc.document) ? nextDoc.document : nextDoc;

	return [div({ id: 'submitted-box', class: 'business-process-submitted-box' },
		div({ class: 'business-process-submitted-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
				this.document._label),
			div({ class: 'business-process-revision-box-controls' },
				_if(prevDoc,
					a({ href: urlPrefix + resolve(prevDoc, 'docUrl'),
						class: 'hint-optional hint-optional-left',
						'data-hint': _('Previous document') },
						i({ class: 'fa fa-angle-left' }))),
				_if(nextDoc,
					a({ href: urlPrefix + resolve(nextDoc, 'docUrl'),
						class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
						i({ class: 'fa fa-angle-right' })))
					))),
		div({ id: 'user-document', class: 'business-process-submitted-selected-document' },
			div({ class: 'submitted-preview' },
				div({ id: 'document-preview', class: 'submitted-preview-document' },
					renderDocument(this.document)),
				div({ id: 'document-history', class: 'submitted-preview-document-history' },
					renderDocumentHistory(this.document))))];
};
