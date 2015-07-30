'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , generateSections = require('./components/generate-sections')
  , nextTick = require('next-tick')
  , db               = require('mano').db

  , user = db.User.prototype
  , _  = require('mano').i18n.bind('User Submitted')
  , formatLastModified = require('./utils/last-modified')
  , format             = require('es5-ext/date/#/format')
  , curry              = require('es5-ext/function/#/curry');

exports._parent = require('./user-base');

exports['submitted-menu'] = function () {
	li(a({ class: 'submitted-menu-item-active' }, "Request"));
};

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
						td(formatLastModified(
							this.businessProcess.submissionForms._isAffidavitSigned._lastModified
						)),
						td(formatLastModified(this.businessProcess._isApproved._lastModified)),
						td(
							list(this.businessProcess.registrations.requested, function (reg) {
								return span({ class: 'label-reg' }, reg._abbr);
							})
						)
					)
				)
			)
		);
		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, "History of your request",
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print history of Your request',
						href: '/print-request-history/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, "Print")
				)),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						this.businessProcess.statusLog.ordered,
						function (log) {
							th(log.label);
							td(log.time && format.call(log.time, '%d/%m/%Y %H:%M'));
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
						}
					)
				)
			)
		);

		section({ class: 'section-primary' },
			h2(_("Documents")),
			hr(),
			_if(gtOrEq(this.businessProcess.requirementUploads.applicable._size, 1),
				[h3(_("Documents required")),
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
								this.businessProcess.requirementUploads.applicable,
								function (requirementUpload, index) {
									td(index + 1);
									td(requirementUpload.document.label);
									td(requirementUpload.document.issuedBy);
									td(requirementUpload.document.issueDate);
									td(a({ href: '/document/' + requirementUpload.master.__id__ + "/" +
											requirementUpload.document.uniqueKey + "/" },
										span({ class: 'fa fa-search' }, _("Search"))));
								}
							)
						)
					)]),
			_if(gtOrEq(this.businessProcess.paymentReceiptUploads.applicable._size, 1),
				[h3(_("Payment receipts")),
					div(
						{ class: 'table-responsive-container' },
						table(
							{ class: 'submitted-user-data-table ' +
								'submitted-current-user-data-table user-request-table' },
							thead(
								tr(
									th(),
									th(_("Name")),
									th(_("Issue date")),
									th()
								)
							),
							tbody(
								this.businessProcess.paymentReceiptUploads.applicable,
								function (receipt, index) {
									td(index + 1);
									td(receipt.document.label);
									td(receipt.document.issueDate);
									td(a({ href: '/receipt/' + receipt.master.__id__ + "/" +
										receipt.document.uniqueKey + "/" },
										span({ class: 'fa fa-search' }, _("Search"))));
								}
							)
						)
					)]),
			_if(gtOrEq(this.businessProcess.certificates.uploaded._size, 1),
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
									console.log(certificate.label);
									td(span({ class: 'fa fa-certificate' }), " ",
										certificate.label);
									td(certificate.issuedBy);
									td(certificate.issueDate);
									td(a({ href: '/certificate/' + certificate.master.__id__ + "/" +
											certificate.uniqueKey + "/" },
										span({ class: 'fa fa-search' }, _("Search"))));
								}
							)
						)
					)]));

		section({ class: 'section-primary entity-data-section-side' },
			h2({ class: 'container-with-nav' }, "Application form",
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': 'Print your application form',
						href: '/user-submitted/data-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, "Print")
				)),

			generateSections(user.formSections));

		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
