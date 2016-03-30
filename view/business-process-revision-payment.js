// Single payment revision view

'use strict';

var _              = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen')
  , getPrevNext = require('../utils/get-prev-next-set')
  , renderDocument = require('./_business-process-revision-document')
  , renderDocumentHistory = require('./_business-process-revision-document-history')

  , paymentForm;

exports._parent = require('./business-process-revision-payments');
exports._match = 'document';

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form(
		{ id: 'form-revision-payment-receipt-upload',
			action: '/form-revision-payment-receipt-upload/' + paymentReceiptUpload.master.__id__ +
				'/' + camelToHyphen.call(paymentReceiptUpload.key) + '/',
			method: 'post', class: 'submitted-preview-form' },
		ul(
			{ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: paymentReceiptUpload._status }))),
			li(
				revFail = div({ class: 'official-form-document-revision-reject-reason' },
					field({ dbjs: paymentReceiptUpload._rejectReasonMemo }))
			),
			li(input({ type: 'submit', value: _("Save") }))
		),
		legacy('radioMatch', 'form-revision-payment-receipt-upload',
			paymentReceiptUpload.__id__ + '/status', { invalid: revFail.getId() })
	);
};

exports['document-preview'] = function () {
	renderDocument(this.document);
};

exports['document-history'] = function () {
	renderDocumentHistory(this.document);
};

exports['revision-box'] = function () {
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

	div({ class: 'business-process-revision-box-header' },
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
				));
	paymentForm(this.document.owner);
};

exports['revision-documents-payments-table'] = function () {
	return div(span(_("Uploaded payment receipt applies to following costs:")),
		br(),
		ul({ class: 'business-process-costs-list' },
			this.document.owner.applicableCosts, function (cost) {
				li(span({ class: 'business-process-costs-list-label' }, cost._label),
					span(cost._amount));
			}));
};
