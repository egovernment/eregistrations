// Documents list and user data

'use strict';

var _            = require('mano').i18n.bind('User Submitted')
  , from         = require('es5-ext/array/from')
  , nextTick     = require('next-tick')
  , scrollBottom = require('../utils/scroll-to-bottom')
  , tableCols    = require('./business-process-table-columns')
  , columns      = from(tableCols.columns);

columns.push(tableCols.archiverColumn);

module.exports = function (context/*, options */) {
	var options         = Object(arguments[1])
	  , businessProcess = context.businessProcess
	  , processingStep  = context.processingStep
	  , urlPrefix       = options.urlPrefix || '/', scrollableElem
	  , historyTitle, historyPrintTitle;

	// TODO: Maybe we could just use generic one?
	if (processingStep) {
		historyTitle = _("History of request");
		historyPrintTitle = _("Print history of request");
	} else {
		historyTitle = _("History of your request");
		historyPrintTitle = _("Print history of your request");
	}

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
			h2({ class: 'container-with-nav' }, historyTitle,
				a({ class: 'hint-optional hint-optional-left', 'data-hint': historyPrintTitle,
					href: urlPrefix + 'print-request-history/', target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print")))),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						businessProcess.statusLog.ordered,
						function (log) {
							th(log.label);
							td({ class: 'submitted-user-history-time' }, log.time);
							td(md(log.text));
							if (processingStep) td(log.official);
						}
					)
				)
			)
		),
		nextTick(function () { scrollBottom(scrollableElem); })
	];
};
