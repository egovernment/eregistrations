// Documents list and user data

'use strict';

var renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list')
  , renderPaymentList     = require('./components/business-process-payments-list');

exports._parent = require('./business-process-submitted');

exports['tab-business-process-documents'] = { class: { active: true } };
exports['tab-content'] = function () {

	section({ class: 'section-primary' },
		div({ class: "section-primary-sub all-documents-table" },
			div(renderCertificateList(this.businessProcess)),
			div(renderDocumentsList(this.businessProcess)),
			div(renderPaymentList(this.businessProcess))),
		div({ id: 'selection-preview' }));
};
