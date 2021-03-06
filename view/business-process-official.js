// Business process main view

'use strict';

var _              = require('mano').i18n.bind('View: Official')
  , renderMainInfo = require('./components/business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var target = this.processingStep || this.businessProcess;

		var hasDocuments = or(
			target.requirementUploads.applicable._size,
			target.paymentReceiptUploads.applicable._size,
			target.certificates.applicable._size
		);

		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });
		insert(exports._prependContent.call(this));
		section({ class: 'section-tab-nav' },
			exports._processingTabLink.call(this),
			_if(hasDocuments, exports._documentsTabLink.call(this)),
			exports._dataTabLink.call(this),
			div({ id: 'tab-content', class: 'business-process-official-content' }));
	}
};

exports._processingTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-processing',
		href: '/' + this.businessProcess.__id__ + '/'
	}, this.processingStep.label);
};

exports._documentsTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-documents',
		href: '/' + this.businessProcess.__id__ + '/documents/'
	}, _("Documents"));
};

exports._dataTabLink = function () {
	return a({
		class: 'section-tab-nav-tab',
		id: 'tab-business-process-data',
		href: '/' + this.businessProcess.__id__ + '/data/'
	}, _("Data"));
};

exports._prependContent = Function.prototype;
