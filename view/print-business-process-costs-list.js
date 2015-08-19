'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	h2(_("Registration costs"));
};

exports.main = function () {
	h2(this.businessProcess._businessName);
	ul(
		{ class: 'print-costs-list' },
		list(this.businessProcess.costs.payable, function (cost) {
			return li(span(cost.label), " ", span(cost.amount));
		}),
		li({ class: 'print-costs-list-total' }, span(_("Total Costs:")),
			" ", span(this.businessProcess.costs.totalAmount))
	);
};
