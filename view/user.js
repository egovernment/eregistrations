// User: Basic data for business processes

'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		section({ class: 'section-primary free-form' },
			md(_("# Welcome to Your Account #" +
				"\n ---" +
				"\n\n From here you can:" +
				"\n 1. Start Process A" +
				"\n 2. Start Process B"))
			);

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'user-account-requests',
					href: '/my-account/' },
				_("My requests")),
			a({ class: 'section-tab-nav-tab',
					id: 'user-account-data',
					href: '/my-account/documents-and-data/' },
				_("My documents and data")),
			div({ id: 'user-account-content' }));

		section({ class: 'section-primary' },
			h1("1. ", _("Online Services")),
			hr(),
			ul({ class: 'registration-init-actions' },
				exports._servicesBoxList(),
				function (item) {
					return _if(item.condition || true, li(
						item.button,
						div({ class: 'free-form' }, md(item.content))
					));
				}));
	}
};

exports._servicesBoxList = Function.prototype;
