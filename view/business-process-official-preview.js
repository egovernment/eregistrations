// Business process main view

'use strict';

var renderMainInfo = require('./_business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });
		div({ id: 'business-process-official-content', class: 'business-process-official-content' });
	}
};
