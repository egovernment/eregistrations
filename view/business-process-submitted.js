'use strict';

var _        = require('mano').i18n.bind('View: Submitted')
  , mainInfo = require('./components/business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var hasDocuments = or(
			this.businessProcess.requirementUploads.applicable._size,
			this.businessProcess.paymentReceiptUploads.applicable._size,
			this.businessProcess.certificates.userApplicable._size
		);

		mainInfo(this);

		section({ class: 'section-tab-nav' },
			_if(hasDocuments, exports._documentsTabLink.call(this)),
			exports._dataTabLink.call(this),
			div({ id: 'tab-content', class: 'business-process-revision' }));
	}
};

exports._documentsTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-documents',
		href: '/'
	}, _("Documents"));
};

exports._dataTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-data',
		href: '/data/'
	}, _("Data"));
};
