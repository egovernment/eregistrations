// Documents list and user data

'use strict';

var _            = require('mano').i18n.bind('View: Component: Business Process info')
  , from         = require('es5-ext/array/from')
  , nextTick     = require('next-tick')
  , isUserApp    = require('../../utils/is-user-app')
  , scrollBottom = require('../utils/scroll-to-bottom')
  , tableCols    = require('./business-process-table-columns')
  , columns      = from(tableCols.columns);

columns.push(tableCols.archiverColumn);

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
		insert(_if(and(businessProcess._isSubmitted._lastModified.map(function (modTime) {
			var timeInMs;
			if (!modTime) return;
			timeInMs = (modTime / 1000);
			return timeInMs >= Date.now() - (1000 * 60);
		}), eq(context.user._currentRoleResolved, 'user')),
			div({ id: 'submission-success-message', class: 'entities-overview-info-success' },
				_("Your file was submitted successfully."),
				span({ id: 'close-submission-success-message',
					class: 'fa fa-close' }))), script(function () {
			var successMsg = $('submission-success-message');
			if (!successMsg || !successMsg.parentNode) return;
			$('close-submission-success-message').onclick = function (ev) {
				successMsg.parentNode.removeChild(successMsg);
			};
			setTimeout(function () {
				successMsg.parentNode.removeChild(successMsg);
			}, 10000);
		})),
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
