// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-documents-list')
  , renderCertificateList = require('./_business-process-certificates-list')
  , renderPaymentList = require('./_business-process-payments-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-documents'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var options = Object(arguments[0])
	  , businessProcess = this.businessProcess
	  , uploadsResolver = options.uploadsResolver || businessProcess;

	options.documentsTarget = businessProcess;
	options.certificatesTarget = uploadsResolver;
	options.paymentsTarget = uploadsResolver;

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(this, options)),
				div(renderDocumentsList(this, options)),
				div(renderPaymentList(this, options))),
			div({ id: 'selection-preview' })
		)];
};
