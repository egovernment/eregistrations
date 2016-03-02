// User Manager: Base view

'use strict';

var _ = require('mano').i18n.bind('User-manager');

exports._parent = require('./user-base');

exports['submitted-menu'] = function () {
	li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, _("Notary dashboard")));
};

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		div({ class: 'user-account-boxes' },
			section({ id: 'welcome-box', class: 'user-account-welcome' },
				header(
					h3(_("Welcome to your notary account. From here you can:"))
				),
				div({ class: 'free-form' },
					md(_("1. Access all the requests of your clients in draft, in process, finished.\n" +
						"2. Start a new service for one of your clients.")))
				));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab user-account-tab',
					id: 'manager-account-clients',
					href: '/' },
				_("Clients")),
			a({ class: 'section-tab-nav-tab user-account-tab',
					id: 'manager-account-requests',
					href: '/requests/' },
				_("Requests")),
			div({ id: 'manager-account-content', class: 'section-primary' }));
	}
};
