// Documents list and user data

'use strict';

var _            = require('mano').i18n.bind('View: Component: Business Process info')
  , from         = require('es5-ext/array/from')
  , nextTick     = require('next-tick')
  , isUserApp    = require('../../utils/is-user-app')
  , scrollBottom = require('../utils/scroll-to-bottom')
  , tableCols    = require('./table-columns')
  , columns      = from(require('./business-processes-table-columns'));

columns.push(tableCols.businessProcessArchiverColumn);

module.exports = exports = function (context) {
	var businessProcess = context.businessProcess
	  , statusLogs      = businessProcess.statusLog.ordered
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
				div({ class: 'entities-overview-info-message' },
					_("Your file was submitted successfully.")),
				div({ class: 'entities-overview-info-dismiss' },
					span({ id: 'close-submission-success-message',
						class: 'fa fa-close' })))), script(function () {
			var successMsg = $('submission-success-message');
			if (!successMsg || !successMsg.parentNode) return;
			$('close-submission-success-message').onclick = function (ev) {
				successMsg.parentNode.removeChild(successMsg);
			};
			setTimeout(function () {
				successMsg.parentNode.removeChild(successMsg);
			}, 10000);
		})),
		exports._extraContent.call(context),
		section(
			{ class: 'section-primary' },
			h2(
				{ class: 'container-with-nav' },
				_("History of request"),
				_if(statusLogs.size, a({ class: 'hint-optional hint-optional-left',
					'data-hint': _("Print history of request"), href: '/business-process-status-log-print' +
						(isUserApp(context.appName) ? '' : '?id=' + businessProcess.__id__), target: '_blank' },
					span({ class: 'fa fa-print' }, _("Print"))))
			),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(statusLogs, function (log) {
						th(log._label);
						td({ class: 'submitted-user-history-time' }, log._time);
						td(md(log._text));
						if (!isUserApp(context.appName)) {
							insert(_if(log._officialFullName, td(log._officialFullName), td(log._official)));
						}
					})
				)
			)
		),
		nextTick(function () { scrollBottom(scrollableElem); })
	];
};

exports._extraContent = Function.prototype;
