// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-documents-list')
  , renderCertificateList = require('./_business-process-certificates-list')
  , renderPaymentList = require('./_business-process-payments-list');

exports._parent = require('./business-process-official');
exports._match = 'businessProcess';

exports['business-process-official-documents'] = { class: { active: true } };
exports['business-process-official-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , uploadsResolver = options.uploadsResolver || businessProcess
	  , selectedDocumentId = this.document ?  this.document.__id__ : null;

	options.urlPrefix = urlPrefix;
	options.uploadsResolver = uploadsResolver;
	options.selectedDocumentId = selectedDocumentId;
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
