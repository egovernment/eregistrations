// Business process main view

'use strict';

var renderMainInfo = require('./_business-process-main-info')
  , renderDocumentsAndData = require('./_business-process-documents-and-data');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });

		exports._customPreviewInfo(this);

		div({ id: 'business-process-official-content', class: 'business-process-official-content' },
			renderDocumentsAndData(this, {
				urlPrefix: '/' + this.businessProcess.__id__ + '/',
				uploadsResolver: this.processingStep
			}));
	}
};

exports._customPreviewInfo = Function.prototype;
