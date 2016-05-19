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
		div({ class: "section-primary-sub document-preview-all-documents-table" },
			div(renderCertificateList(this, options)),
			div(renderDocumentsList(this, assign({
				documentsRootHref:
					document.getElementById('tab-business-process-documents').getAttribute('href')
			}, options))),
			div(renderPaymentList(this, options))),
		div({ id: 'selection-preview' }));
};
