// Documents list and user data

'use strict';

var renderDocumentsList = require('./_business-process-documents-list')
  , renderCertificateList = require('./_business-process-certificates-list')
  , renderPaymentList = require('./_business-process-payments-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-documents'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var options = Object(arguments[0]);

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(this.businessProcess, options)),
				div(renderDocumentsList(this.businessProcess, options)),
				div(renderPaymentList(this.businessProcess, options))),
			div({ id: 'selection-preview' })
		)];
};
