'use strict';

var _      = require('mano').i18n.bind('User')
  , format = require('es5-ext/date/#/format');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	h2(_("Registration history"));
	p(format.call(new Date(), '%d/%m/%Y'));
};

exports.main = function () {
	h2(this.businessProcess._businessName);
	table(
		{ class: 'print-user-history' },
		tbody(this.businessProcess.statusLog.ordered,
			function (log) {
				th(div(log.label));
				td(div(format.call(log.time, '%d/%m/%Y %H:%M')));
				td(div(log.text));
				td(div(log.official));
			})
	);
};
