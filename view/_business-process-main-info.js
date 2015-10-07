// Documents list and user data

'use strict';

var curry              = require('es5-ext/function/#/curry')
  , nextTick           = require('next-tick')
  , _                  = require('mano').i18n.bind('User Submitted')
  , scrollBottom       = require('./utils/scroll-to-bottom')
  , tableCols;

tableCols = require('./_business-process-table-columns');

module.exports = function (context/*, options */) {
	var options = Object(arguments[1])
	  , businessProcess = context.businessProcess
	  , urlPrefix = options.urlPrefix || '/', scrollableElem;

	return [section(
		{ class: 'submitted-main table-responsive-container' },
		table(
			{ class: 'submitted-user-data-table submitted-current-user-data-table', responsive: true },
			thead(
				tr(
					list(tableCols, function (col) {
						th(typeof col.head === 'function' ? col.head(businessProcess) : col.head);
					})
				)
			),
			tbody(
				tr(
					list(tableCols, function (col) {
						td(typeof col.data === 'function' ? col.data(businessProcess) : col.data);
					})
				)
			)
		)
	),
		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, _("History of your request"),
				a(
					{ class: 'hint-optional hint-optional-left',
						'data-hint': _("Print history of your request"),
						href: urlPrefix + 'print-request-history/',
						target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))
				)),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						businessProcess.statusLog.ordered,
						function (log) {
							th(log.label);
							td({ class: 'submitted-user-history-time' }, log.time);
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
							if (context.processingStep) td(log.official);
						}
					)
				)
			)
		),
		nextTick(function () { scrollBottom(scrollableElem); })];
};
