// Documents list and user data

'use strict';

var assign                = require('es5-ext/object/assign')
  , renderDocumentsList   = require('./components/business-process-documents-list')
  , renderCertificateList = require('./components/business-process-certificates-list')
  , renderPaymentList     = require('./components/business-process-payments-list');

exports._parent = require('./business-process-official');

exports['tab-business-process-documents'] = { class: { active: true } };
exports['tab-content'] = function () {
	var options = { urlPrefix: '/' + this.businessProcess.__id__ + '/' };

	return section({ class: 'section-primary' },
		div({ class: "section-primary-sub documents-list-table" },
			renderCertificateList(this, options),
			renderDocumentsList(this, assign({
				documentsRootHref:
					document.getElementById('tab-business-process-documents').getAttribute('href')
			}, options)),
			renderPaymentList(this, options)),
		div({ id: 'selection-preview' }));
};
