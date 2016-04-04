// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-documents-list')
  , renderCertificateList = require('./_business-process-certificates-list')
  , renderPaymentList = require('./_business-process-payments-list')
  , camelToHyphen  = require('es5-ext/string/#/camel-to-hyphen');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports._dynamic = function () {
	var listItemId = 'document-item-' + camelToHyphen.call(this.document.uniqueKey);
	var conf = {};
	conf[listItemId] = { class: { active: true } };
	return conf;
};

exports['tab-documents'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
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
