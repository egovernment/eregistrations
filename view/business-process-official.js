// Business process main view

'use strict';

var renderMainInfo = require('./_business-process-main-info')
  , _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		renderMainInfo(this.businessProcess);
		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-official-form',
					href: '/official/business-process-official-details/' },
				this.processingStep.label),
			a({ class: 'section-tab-nav-tab',
					id: 'business-process-official-details',
					href: '/official/business-process-official-form/document/' },
				_("Documents and data")),
			div({ id: 'tab' }));
	}
};
