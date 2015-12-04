// Business process main view

'use strict';

var renderMainInfo = require('./_business-process-main-info')
  , _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		renderMainInfo(this, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });
		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-official-form',
					href: '/' + this.businessProcess.__id__ + '/' },
				this.processingStep.label),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-official-details',
					href: '/' + this.businessProcess.__id__ + '/documents-and-data/' },
				_("Documents and data")),
			div({ id: 'business-process-official-content', class: 'business-process-official-content' }));
	}
};
