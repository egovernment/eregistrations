// Documents viewer

'use strict';

var _     = require('mano').i18n.bind('View: Component: Documents');

module.exports = function (documentData) {
	return _if(documentData.statusLog._length || documentData.statusLog.length, function () {
		return [
			h3({ class: 'submitted-user-history-header' }, _("Document history")),
			div({ class: 'submitted-user-history-wrapper' },
				table({ class: 'submitted-user-history' },
					tbody(documentData.statusLog, function (log) {
						th(log._label || log.label);
						td({ class: 'submitted-user-history-time' }, log._time || log.time);
						td(md(log._text || log.text));
					})))
		];
	});
};
