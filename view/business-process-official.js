// Business process main view

'use strict';

var _              = require('mano').i18n.bind('Registration')
  , renderMainInfo = require('./components/business-process-main-info');

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
					id: 'business-process-official-documents',
					href: '/' + this.businessProcess.__id__ + '/documents/' },
				_("Documents")),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-official-data',
					href: '/' + this.businessProcess.__id__ + '/data/' },
				_("Data")),
			div({ id: 'business-process-official-content', class: 'business-process-official-content' }));
	}
};
