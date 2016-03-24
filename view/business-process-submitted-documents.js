// Documents list and user data

'use strict';

var generateSections = require('./components/generate-sections')
  , renderDocumentsList = require('./_business-process-draw-document-list')
  , renderCertificateList = require('./_business-process-draw-certificate-list')
  , renderPaymentList = require('./_business-process-draw-payment-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-documents'] = { class: { active: true } };
exports['user-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , uploadsResolver = options.uploadsResolver || businessProcess;

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderDocumentsList(businessProcess, urlPrefix)),
				div(renderPaymentList(uploadsResolver, urlPrefix)),
				div(renderCertificateList(uploadsResolver, urlPrefix))),
			div({ id: 'submitted-box', class: 'business-process-submitted-box' }),
			div({ id: 'user-document', class: 'business-process-revision-selected-document' },
				div({ class: 'submitted-preview' },
					div({ id: 'document-preview', class: 'submitted-preview-document' }),
					div({ class: 'submitted-preview-user-data  entity-data-section-side' },
						generateSections(businessProcess.dataForms.applicable, { viewContext: this })
						),
					div({ id: 'document-history', class: 'submitted-preview-document-history' })
					)
				)
		)];
};
