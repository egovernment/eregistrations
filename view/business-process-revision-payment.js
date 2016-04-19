// Single payment revision view

'use strict';

var _                     = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , reactiveSibling       = require('../utils/reactive-sibling')
  , renderDocument        = require('./components/business-process-document-preview')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , generateSections      = require('./components/generate-sections')

  , paymentForm;

exports._parent = require('./business-process-revision-payments');
exports._match = 'document';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

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

exports['revision-document'] = function () {
	var doc = this.document;
	var reqUploads = this.processingStep.requirementUploads.applicable;
	var nextReqUpload = reactiveSibling.next(reqUploads, doc.owner);
	var nextReqUploadUrl = nextReqUpload.map(function (nextReqUpload) {
		if (!nextReqUpload) return null;
		return nextReqUpload.docUrl;
	});
	var prevReqUpload = reactiveSibling.previous(reqUploads, doc.owner);
	var prevReqUploadUrl = prevReqUpload.map(function (nextReqUpload) {
		if (!prevReqUpload) return null;
		return prevReqUpload.docUrl;
	});

	return [div({ id: 'revision-box', class: 'business-process-revision-box' },
		div({ class: 'business-process-revision-box-header' },
			div({ class: 'business-process-submitted-box-header-document-title' },
					doc._label),
			div({ class: 'business-process-revision-box-controls' },
				_if(prevReqUpload,
					a({ href: prevReqUploadUrl,
						class: 'hint-optional hint-optional-left',
						'data-hint': _('Previous document') },
						i({ class: 'fa fa-angle-left' }))),
				_if(nextReqUpload,
					a({ href: nextReqUploadUrl,
						class: 'hint-optional hint-optional-left', 'data-hint': _('Next document') },
						i({ class: 'fa fa-angle-right' })))
					)),
		paymentForm(doc.owner)
		),
		div({ class: 'submitted-preview' },
			div({ id: 'document-preview', class: 'submitted-preview-document' },
				renderDocument(doc)),
			div({ class: 'submitted-preview-user-data  entity-data-section-side' },
				div({ id: 'revision-documents-payments-table' },
					div(span(_("Uploaded payment receipt applies to following costs:")),
						br(),
						ul({ class: 'business-process-costs-list' },
							this.document.owner.applicableCosts, function (cost) {
								li(span({ class: 'business-process-costs-list-label' }, cost._label),
									span(cost._amount));
							}))),
				generateSections(this.businessProcess.dataForms.applicable, { viewContext: this })
				),
			div({ id: 'document-history', class: 'submitted-preview-document-history' },
				renderDocumentHistory(doc))
			)
		];

};
