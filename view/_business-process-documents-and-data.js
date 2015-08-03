// Documents list and user data

'use strict';

var _  = require('mano').i18n.bind('User Submitted')
, generateSections = require('./components/generate-sections');

module.exports = function (businessProcess) {

	return [section({ class: 'section-primary' },
		h2(_("Documents")),
		hr(),
		_if(businessProcess.requirementUploads.applicable._size,
			[h3(_("Documents required")),
				div(
					{ class: 'table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table ' +
							'submitted-current-user-data-table user-request-table' },
						thead(
							tr(
								th(_("Status")),
								th(_("Name")),
								th(_("Issuer")),
								th(_("Issue date")),
								th()
							)
						),
						tbody(
							businessProcess.requirementUploads.applicable,
							function (requirementUpload) {
								td(_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
										_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' })));
								td(requirementUpload.document._label);
								td(requirementUpload.document._issuedBy);
								td(requirementUpload.document._issueDate);
								td(a({ href: '/document/' +
										requirementUpload.document.uniqueKey + "/" },
									span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)]),
		_if(businessProcess.paymentReceiptUploads.applicable._size,
			[h3(_("Payment receipts")),
				div(
					{ class: 'table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table ' +
							'submitted-current-user-data-table user-request-table' },
						thead(
							tr(
								th(_("Name")),
								th(_("Issue date")),
								th()
							)
						),
						tbody(
							businessProcess.paymentReceiptUploads.applicable,
							function (receipt) {
								td(receipt.document.label);
								td(receipt.document._issueDate);
								td(a({ href: '/receipt/' +
									receipt.document.key + "/" },
									span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)]),
		_if(businessProcess.certificates.uploaded._size,
			[h3(_("Certificates")),
				div(
					{ class: 'table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table ' +
							'submitted-current-user-data-table user-request-table' },
						thead(
							tr(
								th(),
								th(_("Name")),
								th(_("Issuer")),
								th(_("Issue date")),
								th()
							)
						),
						tbody(
							businessProcess.certificates.uploaded,
							function (certificate) {
								td(span({ class: 'fa fa-certificate' }));
								td(certificate.label);
								td(certificate._issuedBy);
								td(certificate._issueDate);
								td(a({ href: '/certificate/' +
										certificate.key + "/" },
									span({ class: 'fa fa-search' }, _("Go to"))));
							}
						)
					)
				)])),
		section({ class: 'section-primary entity-data-section-side' },
			h2({ class: 'container-with-nav' }, _("Date"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print your application form',
						href: '/user-submitted/data-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)),

			generateSections(businessProcess.dataForms.applicable))];
};
