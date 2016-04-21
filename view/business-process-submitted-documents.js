// Documents list and user data

'use strict';

var renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list')
  , renderPaymentList     = require('./components/business-process-payments-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-documents'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var options = Object(arguments[0]);

	section(
		{ class: 'section-primary' },
		div(
			{ class: "section-primary-sub all-documents-table" },
			div(renderCertificateList(this.businessProcess, options)),
			div(renderDocumentsList(this.businessProcess, options)),
			div(renderPaymentList(this.businessProcess, options))
		),
		div({ id: 'selection-preview' })
	);
};
