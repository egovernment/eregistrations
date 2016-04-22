// Single payment revision view

'use strict';

var _                     = require('mano').i18n.bind('Official: Revision')
  , camelToHyphen         = require('es5-ext/string/#/camel-to-hyphen')
  , documentView          = require('./components/business-process-document')
  , renderDocumentHistory = require('./components/business-process-document-history')
  , documentRevisionInfo  = require('./components/business-process-document-review-info')
  , generateSections      = require('./components/generate-sections')
  , disableStep           = require('./components/disable-processing-step')

  , paymentForm;

exports._parent  = require('./business-process-revision-payments');
exports._dynamic = require('./utils/document-dynamic-matcher')('receipt');
exports._match   = 'document';

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form(
		{ id: 'form-revision-payment-receipt-upload',
			action: '/form-revision-payment-receipt-upload/' + paymentReceiptUpload.master.__id__ +
				'/' + camelToHyphen.call(paymentReceiptUpload.document.docUrl) + '/',
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
	var doc            = this.document
	  , processingStep = this.processingStep;

	insert([
		documentView(doc, this.processingStep.paymentReceiptUploads.applicable, {
			prependContent: insert(_if(processingStep.processableUploads.has(doc.owner),
				disableStep(this.processingStep, paymentForm(doc.owner)),
				documentRevisionInfo(doc))),
			sideContent: generateSections(this.businessProcess.dataForms.applicable,
				{ viewContext: this })
		}),
		renderDocumentHistory(doc)
	]);
};
