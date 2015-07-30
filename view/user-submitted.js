'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , generateSections = require('./components/generate-sections')
  , nextTick = require('next-tick')
  , _  = require('mano').i18n.bind('User Submitted')
  , formatLastModified = require('./utils/last-modified')
  , curry              = require('es5-ext/function/#/curry');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var scrollableElem;

		section(
			{ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table submitted-current-user-data-table', responsive: true },
				thead(
					tr(
						th(_("Entity")),
						th(_("Service")),
						th(_("Submission date")),
						th(_("Withdraw date")),
						th(_("Inscriptions and controls"))
					)
				),
				tbody(
					tr(
						td(this.businessProcess._businessName),
						td(this.businessProcess._label),
						td(this.businessProcess.submissionForms
							._isAffidavitSigned._lastModified.map(formatLastModified)),
						td(formatLastModified(this.businessProcess._isApproved._lastModified)),
						td(
							list(this.businessProcess.registrations.requested, function (reg) {
								return span({ class: 'label-reg' }, reg.abbr);
							})
						)
					)
				)
			)
		);
		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, _("History of your request"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': _("Print history of your request"),
						href: '/print-request-history/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						this.businessProcess.statusLog.ordered,
						function (log) {
							th(log.label);
							td(log.time);
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
						}
					)
				)
			)
		);

		section({ class: 'section-primary' },
			h2(_("Documents")),
			hr(),
			_if(this.businessProcess.requirementUploads.applicable._size,
				[h3(_("Documents required")),
					div(
						{ class: 'table-responsive-container' },
						table(
							{ class: 'submitted-user-data-table ' +
								'submitted-current-user-data-table user-request-table' },
							thead(
								tr(
									th(_("Name")),
									th(_("Issuer")),
									th(_("Issue date")),
									th()
								)
							),
							tbody(
								this.businessProcess.requirementUploads.applicable,
								function (requirementUpload) {
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
			_if(this.businessProcess.paymentReceiptUploads.applicable._size,
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
								this.businessProcess.paymentReceiptUploads.applicable,
								function (receipt) {
									td(receipt.document.label);
									td(receipt.document.issueDate);
									td(a({ href: '/receipt/' +
										receipt.document.uniqueKey + "/" },
										span({ class: 'fa fa-search' }, _("Go to"))));
								}
							)
						)
					)]),
			_if(this.businessProcess.certificates.uploaded._size,
				[h3(_("Certificates")),
					div(
						{ class: 'table-responsive-container' },
						table(
							{ class: 'submitted-user-data-table ' +
								'submitted-current-user-data-table user-request-table' },
							thead(
								tr(
									th(_("Name")),
									th(_("Issuer")),
									th(_("Issue date")),
									th()
								)
							),
							tbody(
								this.businessProcess.certificates.uploaded,
								function (certificate) {
									td(span({ class: 'fa fa-certificate' }), " ",
										certificate.label);
									td(certificate.issuedBy);
									td(certificate.issueDate);
									td(a({ href: '/certificate/' +
											certificate.uniqueKey + "/" },
										span({ class: 'fa fa-search' }, _("Go to"))));
								}
							)
						)
					)]));

		section({ class: 'section-primary entity-data-section-side' },
			h2({ class: 'container-with-nav' }, _("Application form"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print your application form',
						href: '/user-submitted/data-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)),

			generateSections(this.businessProcess.dataForms.applicable));

		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
