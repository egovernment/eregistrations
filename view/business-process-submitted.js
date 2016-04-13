'use strict';

var _        = require('mano').i18n.bind('Official: Revision')
  , mainInfo = require('./_business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		mainInfo(this);
		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'tab-documents',
					href: '/' },
				_("Documents")),
			a({ class: 'section-tab-nav-tab',
					id: 'tab-data',
					href: '/data/' },
				_("Data")),
			div({ id: 'tab-content', class: 'business-process-revision' }));
	}
};
