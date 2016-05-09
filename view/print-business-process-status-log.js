'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = _("Registration history");

exports.main = function () {
	section({ class: 'section-primary' },
		h2(this.businessProcess._businessName),
		table({ class: 'print-user-history' },
			tbody(this.businessProcess.statusLog.ordered,
				function (log) {
					th(log._label);
					td({ class: 'print-user-history-time' }, log._time);
					td(md(log._text));
					if (this.processingStep) td(log._official);
				}, this)));
};
