// Payments list and user data

'use strict';

var renderPaymentList = require('./components/business-process-payments-list');

exports._parent = require('./business-process-revision');

exports['tab-business-process-payments'] = { class: { active: true } };
exports['tab-content'] = function () {
	var options = { urlPrefix: '/' + this.businessProcess.__id__ + '/' };

	return section(
		{ class: 'section-primary' },
		div(
			{ class: "section-primary-sub" },
			div(renderPaymentList(this.businessProcess, options))
		),
		div({ id: 'selection-preview' })
	);
};
