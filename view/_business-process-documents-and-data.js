// Documents list and user data

'use strict';

var camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('User Submitted')
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
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th(_("Issuer")),
								th({ class: 'submitted-user-data-table-issue-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(
							businessProcess.requirementUploads.applicable,
							function (requirementUpload) {
								td({ class: 'submitted-user-data-table-status' },
									_if(requirementUpload._isApproved, span({ class: 'fa fa-check' })),
										_if(requirementUpload._isRejected, span({ class: 'fa fa-exclamation' })));
								td(requirementUpload.document._label);
								td(requirementUpload.document._issuedBy);
								td({ class: 'submitted-user-data-table-issue-date' },
										requirementUpload.document._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: '/document/' +
										camelToHyphen.call(requirementUpload.document.uniqueKey) + "/" },
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
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th({ class: 'submitted-user-data-table-issue-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(
							businessProcess.paymentReceiptUploads.applicable,
							function (receipt) {
								td({ class: 'submitted-user-data-table-status' },
									_if(receipt._isApproved, span({ class: 'fa fa-check' })),
										_if(receipt._isRejected, span({ class: 'fa fa-exclamation' })));
								td(receipt.document.label);
								td({ class: 'submitted-user-data-table-issue-date' }, receipt.document._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: '/receipt/' + camelToHyphen.call(receipt.key) + "/" },
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
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th(_("Issuer")),
								th({ class: 'submitted-user-data-table-issue-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(
							businessProcess.certificates.uploaded,
							function (certificate) {
								td({ class: 'submitted-user-data-table-status' },
									span({ class: 'fa fa-certificate' }));
								td(certificate.label);
								td(certificate._issuedBy);
								td({ class: 'submitted-user-data-table-issue-date' }, certificate._issueDate);
								td({ class: 'submitted-user-data-table-link' },
									a({ href: '/certificate/' + camelToHyphen.call(certificate.key) + "/" },
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
						href: '/data-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)),

			generateSections(businessProcess.dataForms.applicable))];
};
