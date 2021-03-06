// Single payment revision view

'use strict';

var camelToHyphen              = require('es5-ext/string/#/camel-to-hyphen')
  , _                          = require('mano').i18n.bind('View: Official: Revision')
  , renderDocument             = require('./components/document-preview')
  , renderDocumentHistory      = require('./components/business-process-document-history')
  , renderDocumentRevisionInfo = require('./components/business-process-document-review-info')
  , renderSections             = require('./components/render-sections-json')
  , disableStep                = require('./components/disable-processing-step')
  , getDocumentData            = require('./utils/get-document-data')

  , paymentForm;

exports._parent  = require('./business-process-revision-payments');
exports._dynamic = require('./utils/document-dynamic-matcher')('receipt');
exports._match = 'documentUniqueId';

paymentForm = function (paymentReceiptUpload) {
	var revFail;
	return form({
		id: 'form-revision-payment-receipt-upload',
		class: ['submitted-preview-form', _if(eq(paymentReceiptUpload._revisionProgress, 1),
			'completed')],
		method: 'post',
		action: '/form-revision-payment-receipt-upload/' + paymentReceiptUpload.master.__id__ +
			'/' + camelToHyphen.call(paymentReceiptUpload.key) + '/'
	},
		ul({ class: 'form-elements' },
			li(div({ class: 'input' }, input({ dbjs: paymentReceiptUpload._status }))),
			revFail = li(div({ class: 'official-form-document-revision-reject-reason' },
				field({ dbjs: paymentReceiptUpload._rejectReasonMemo }))),
			exports._extraFormFields.call(this),
			li(input({ type: 'submit', value: _("Save") }))),
		legacy('radioMatch', 'form-revision-payment-receipt-upload',
			paymentReceiptUpload.__id__ + '/status', { invalid: revFail.getId() }));
};

exports._extraFormFields = Function.prototype;

exports['selection-preview'] = function () {
	var documentData = getDocumentData(this), isProcessable;

	if (this.document) {
		isProcessable  = this.processingStep.paymentReceiptUploads.processable
			._has(this.document.owner);
	}

	insert(
		renderDocument(this, documentData, {
			prependContent: _if(isProcessable, function () {
				return div(disableStep(this.processingStep, paymentForm.call(this, this.document.owner)));
			}.bind(this), function () {
				return renderDocumentRevisionInfo(documentData, this.documentKind);
			}.bind(this)),
			mainContent: exports._paymentPreviewContent.call(this, documentData),
			sideContent: exports._renderSections.call(this),
			urlPrefix: '/' + this.businessProcess.__id__ + '/',
			documentsRootHref: '/' + this.businessProcess.__id__ + '/payment-receipts/'
		}),
		renderDocumentHistory(documentData)
	);
};

exports._paymentPreviewContent = Function.prototype;

exports._renderSections = function () {
	return renderSections(this.businessProcess.dataForms.dataSnapshot);
};
