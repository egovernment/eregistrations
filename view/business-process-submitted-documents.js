// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted')
  , generateSections = require('./components/generate-sections')
  , renderDocumentsList = require('./_business-process-draw-document-list');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

var drawPaymentReceiptsPart = function (target, urlPrefix) {
	return _if(target.paymentReceiptUploads.applicable._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Payment receipts")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.paymentReceiptUploads.applicable,
					function (receipt) {
						td(
							{ class: 'submitted-user-data-table-status' },
							_if(receipt._isApproved, span({ class: 'fa fa-check' })),
							_if(receipt._isRejected, span({ class: 'fa fa-exclamation' }))
						);
						td(receipt.document.label);
						td({ class: 'submitted-user-data-table-date' }, receipt.document._issueDate);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'receipt/' + camelToHyphen.call(receipt.key) + "/" },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};

var drawCertificatesPart = function (target, urlPrefix) {
	return _if(target.certificates.uploaded._size, [
		div(
			{ class: 'table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table user-request-table' },
				thead(
					tr(
						th({ class: 'submitted-user-data-table-status' }),
						th(_("Certificates")),
						th(_("Issuer")),
						th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
						th(_("Number")),
						th({ class: 'submitted-user-data-table-link' })
					)
				),
				tbody(
					target.certificates.uploaded,
					function (certificate) {
						td({ class: 'submitted-user-data-table-status' },
							span({ class: 'fa fa-certificate' }));
						td(certificate.label);
						td(certificate._issuedBy);
						td({ class: 'submitted-user-data-table-date' }, certificate._issueDate);
						td(certificate._number);
						td({ class: 'submitted-user-data-table-link' },
							a({ href: urlPrefix + 'certificate/' +
								camelToHyphen.call(certificate.key) + '/' },
								span({ class: 'fa fa-search' }, _("Go to"))));
					}
				)
			)
		)
	]);
};

exports['tab-documents'] = { class: { active: true } };
exports['user-content'] = function (/*options*/) {
	var options = Object(arguments[1])
	  , urlPrefix = options.urlPrefix || '/'
	  , businessProcess = this.businessProcess
	  , uploadsResolver = options.uploadsResolver || businessProcess;

	return [section({ class: 'section-primary' },
			div({ class: "section-primary-sub all-documents-table" },
				div(renderDocumentsList(businessProcess, urlPrefix)),
				div(drawPaymentReceiptsPart(uploadsResolver, urlPrefix)),
				div(drawCertificatesPart(uploadsResolver, urlPrefix))),
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
