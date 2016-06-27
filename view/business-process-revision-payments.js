// Payments list and user data

'use strict';

var renderPaymentList = require('./components/business-process-payments-list');

exports._parent = require('./business-process-revision');

exports['tab-business-process-payments'] = { class: { active: true } };
exports['tab-content'] = function () {
	return section({ class: 'section-primary' },
		div({ class: "section-primary-sub documents-list-table" }, renderPaymentList(this, {
			urlPrefix: '/' + this.businessProcess.__id__ + '/',
			documentsRootHref: exports._documentsRootHref.call(this)
		})),
		div({ id: 'selection-preview' }));
};

exports._documentsRootHref = function () {
	return '/' + this.businessProcess.__id__ + '/payment-receipts/';
};
