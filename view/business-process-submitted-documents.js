// Documents list and user data

'use strict';

var renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list')
  , renderPaymentList     = require('./components/business-process-payments-list');

exports._parent = require('./business-process-submitted');

exports['tab-business-process-documents'] = { class: { active: true } };
exports['tab-content'] = function () {

	section({ class: 'section-primary' },
		div({ class: "section-primary-sub documents-list-table" },
			div(renderCertificateList(this)),
			div(renderDocumentsList(this, { documentsRootHref: '/' })),
			div(renderPaymentList(this))),
		div({ id: 'selection-preview' }));
};
