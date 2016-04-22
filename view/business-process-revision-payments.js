// Payments list and user data

'use strict';

var renderPaymentList = require('./components/business-process-payments-list');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-payments'] = { class: { active: true } };
exports['official-revision-content'] = function () {
	return section(
		{ class: 'section-primary' },
		renderPaymentList(this.businessProcess, { urlPrefix: '/' + this.businessProcess.__id__ + '/' }),
		div({ id: 'revision-document', class: 'business-process-revision-selected-document' })
	);
};
