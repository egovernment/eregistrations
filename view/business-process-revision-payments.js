// Payments list and user data

'use strict';

var generateSections = require('./components/generate-sections')
  , renderPaymentList = require('./_business-process-draw-payment-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-payments'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			renderPaymentList(businessProcess, urlPrefix),
			div({ id: 'revision-document', class: 'business-process-revision-selected-document' },
				div({ id: 'revision-box', class: 'business-process-revision-box' }),
				div({ class: 'submitted-preview' },
					div({ id: 'document-preview', class: 'submitted-preview-document' }),
					div({ class: 'submitted-preview-user-data  entity-data-section-side' },
						div({ id: 'revision-documents-payments-table' }),
						generateSections(businessProcess.dataForms.applicable, { viewContext: this })
						),
					div({ id: 'document-history', class: 'submitted-preview-document-history' })
					)
				)
		)];
};
