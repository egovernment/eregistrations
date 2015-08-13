'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = _("Registration history");

exports.main = function () {
	h2(this.businessProcess._businessName);
	table(
		{ class: 'print-user-history' },
		tbody(this.businessProcess.statusLog.ordered,
			function (log) {
				th(log.label);
				td({ class: 'print-user-history-time' }, log._time);
				td(log.text);
				td(log.official);
			})
	);
};
