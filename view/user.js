// User: Basic data for business processes

'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		div({ class: 'user-account-boxes' },
			section({ class: 'section-primary user-account-id-block' },
				h3("Vianney Lesaffre"),
				ul(li(a({ href: '/profile/' },
					i({ class: 'fa fa-angle-right' }), _('Personal informations'))),
					li(a({ href: '/profile/' },
						i({ class: 'fa fa-angle-right' }), _('Change your password'))),
					li(a({ href: '/logout/' },
						i({ class: 'fa fa-angle-right' }), _('Log out'))))
				),
			section({ id: 'welcome-box', open: true, class: 'section-primary user-account-welcome' },
				header(
					h3("Welcome to your account. From here you can:"),
					a({ onclick: '$(\'welcome-box\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
				),
				ul(li(a("1.",
					_('Access all your requests in draft, in process, finished'))),
					li(a("2.",
						_('Access and edit your documents and data'))),
					li(a("3.",
						_('Start a new service related to your company'))))
				));

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

		h3({ class: 'section-title' }, _("Available services"));
		section({ class: 'section-primary' },
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
