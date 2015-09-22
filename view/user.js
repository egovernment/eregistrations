// User: Basic data for business processes

'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {

		div({ class: 'user-account-boxes' },
			section({ class: 'section-primary user-account-id-block' },
				h3(this.user._fullName),
				ul(li(a({ href: '/profile/' },
					i({ class: 'fa fa-angle-right' }), _('Personal informations'))),
					li(a({ href: '/profile/' },
						i({ class: 'fa fa-angle-right' }), _('Change your password'))),
					li(a({ href: '/logout/' },
						i({ class: 'fa fa-angle-right' }), _('Log out'))))
				),
			section({ id: 'welcome-box', class: 'section-primary user-account-welcome' },
				header(
					h3(_("Welcome to your account. From here you can:")),
					a({ onclick: '$(\'welcome-box\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
				),
				div({ class: 'free-form' },
					md(_("1. Access all your requests in draft, in process, finished\n" +
						"2. Access and edit your documents and data\n" +
						"3. Start a new service related to your company")))
				));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab',
					id: 'user-account-requests',
					href: '/my-account/' },
				_("My requests")),
			a({ class: 'section-tab-nav-tab',
					id: 'user-account-data',
					href: '/my-account/summary/' },
				_("My documents and data")),
			div({ id: 'user-account-content' }));

		h3({ class: 'section-title' }, _("Available services"));
		section({ class: 'section-primary' },
			ul({ class: 'service-boxes' },
				exports._servicesBoxList(),
				function (item) {
					return li(_if(item.condition || true, _if(
						item.actionUrl,
						form({ class: 'service-box', action: item.actionUrl, method: 'post' },
							button({ type: 'submit' }, item.mainButton),
							div(div({ class: 'free-form' }, item.content), p(button({ type: 'submit' },
									i({ class: 'fa fa-angle-right' }), _('Click to start'))))),
						div({ class: 'service-box' },
							a({ href: item.hrefUrl }, item.mainButton),
							div(div({ class: 'free-form' }, item.content), p(a({ href: item.hrefUrl },
								i({ class: 'fa fa-angle-right' }), _('Click to start')))))
					)));
				}));
	}
};

exports._servicesBoxList = Function.prototype;
