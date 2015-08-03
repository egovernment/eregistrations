'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , _  = require('mano').i18n.bind('User Submitted')
  , formatLastModified = require('./utils/last-modified')
  , curry              = require('es5-ext/function/#/curry')
  , documentsAndData = require('./_business-process-documents-and-data');

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
						td(this.businessProcess._isApproved._lastModified.map(formatLastModified)),
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
		documentsAndData(this.businessProcess);
		nextTick(function () { scrollBottom(scrollableElem); });
	}
};
