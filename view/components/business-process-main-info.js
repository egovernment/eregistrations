// Documents list and user data

'use strict';

var _            = require('mano').i18n.bind('View: Component: Business Process info')
  , from         = require('es5-ext/array/from')
  , nextTick     = require('next-tick')
  , isUserApp    = require('../../utils/is-user-app')
  , scrollBottom = require('../utils/scroll-to-bottom')
  , tableCols    = require('./table-columns')
  , columns      = from(require('./business-process-table-columns'));

columns.push(tableCols.businessProcessArchiverColumn);

module.exports = function (context) {
	var businessProcess = context.businessProcess
	  , scrollableElem;

	return [
		section(
			{ class: 'submitted-main table-responsive-container' },
			table({
				class: 'submitted-user-data-table',
				configuration: {
					collection: [businessProcess],
					columns: columns
				},
				// Important: this needs to be after configuration directive
				responsive: true
			})
		),
		section(
			{ class: 'section-primary' },
			h2({ class: 'container-with-nav' }, _("History of request"),
				a({ class: 'hint-optional hint-optional-left', 'data-hint': _("Print history of request"),
					href: '/business-process-status-log-print' +
						(isUserApp(context.appName) ? '' : '?id=' + businessProcess.__id__), target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print")))),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						businessProcess.statusLog.ordered,
						function (log) {
							th(log._label);
							td({ class: 'submitted-user-history-time' }, log._time);
							td(md(log._text));
							if (!isUserApp(context.appName)) td(log._official);
						}
					)
				)
			)
		),
		nextTick(function () { scrollBottom(scrollableElem); })
	];
};
