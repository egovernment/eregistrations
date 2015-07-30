'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , generateSections = require('./components/generate-sections')
  , nextTick = require('next-tick')
  , db               = require('mano').db

  , user = db.User.prototype
  , _  = require('mano').i18n.bind('User Submitted')
  , formatLastModified = require('./utils/last-modified');

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
						href: '/user-submitted/history-print/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, "Print")
				)),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						),
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						),
						tr(
							th(div("User")),
							td(div("24/07/2014 10:09:22")),
							td(div("Required modifications sent by user"))
						),
						tr(
							th(div("File sent")),
							td(div("24/07/2014 13:09:22")),
							td(div("File sent"))
						),
						tr(
							th(div("Official")),
							td(div("24/07/2014 16:19:22")),
							td(div("Document accepted"))
						)
					)
				)
			)
		);

		section({ class: 'section-primary' },
			h2(_("Documents")),
			hr(),
			h3(_("Documents required")),
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
						tr(
							td('1'),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			),
			h3(_("Payment receipts")),
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
						tr(
							td('1'),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			),
			h3(_("Certificates")),
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
						tr(
							td(span({ class: 'fa fa-certificate' })),
							td('Lorem ipsum dolor sit'),
							td('User'),
							td('01/01/2015'),
							td(span({ class: 'fa fa-search' }, _("Search")))
						)
					)
				)
			));

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
