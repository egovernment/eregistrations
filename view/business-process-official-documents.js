// Documents list and user data

'use strict';

var renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list')
  , renderPaymentList     = require('./components/business-process-payments-list');

exports._parent = require('./business-process-official');
exports._match = 'businessProcess';

exports['business-process-official-documents'] = { class: { active: true } };
exports['business-process-official-content'] = function () {
	var options ={ urlPrefix: '/' + this.businessProcess.__id__ + '/' };

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderCertificateList(this.businessProcess, options)),
				div(renderDocumentsList(this.businessProcess, options)),
				div(renderPaymentList(this.businessProcess, options))),
			div({ id: 'selection-preview' })
		)];
};
