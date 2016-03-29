// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-draw-document-list')
  , renderCertificateList = require('./_business-process-draw-certificate-list')
  , renderPaymentList = require('./_business-process-draw-payment-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-documents'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , uploadsResolver = options.uploadsResolver || businessProcess
	  , selectedDocumentId = this.document ?  this.document.__id__ : null;

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(uploadsResolver, urlPrefix, selectedDocumentId))),
				div(renderDocumentsList(businessProcess, urlPrefix, selectedDocumentId)),
				div(renderPaymentList(uploadsResolver, urlPrefix, selectedDocumentId)),
			div({ id: 'selection-preview' })
		)];
};
