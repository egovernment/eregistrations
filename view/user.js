// User: Basic data for business processes

'use strict';

var _  = require('mano').i18n.bind('User');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var manager = this.manager;

		div({ class: 'user-account-boxes' },
			section({ id: 'welcome-box', class: 'user-account-welcome' },
				_if(manager, function () {
					var managedUser = manager.currentlyManagedUser;

					return [
						header(
							h3(_("View for client: ${ clientFullName }",
								{ clientFullName: managedUser._fullName }))
						),
						div({ class: 'free-form' },
							md(_("1. From here you can access all the requests of this client in draft, " +
									"in process, finished\n" +
								"2. Start a new service for this client\n" +
								"3. Create an account for this client if not done already")))
					];
				}.bind(this), function () {
					return [
						header(
							h3(_("Welcome to your account. From here you can:"))
						),
						div({ class: 'free-form' },
							md(_("1. Access all your requests in draft, in process, finished\n" +
								"2. Access and edit your documents and data\n" +
								"3. Start a new service related to your company")))
					];
				})));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab user-account-tab',
					id: 'user-account-requests',
					href: '/' },
				_if(manager, _("Requests"), _("My requests"))),
			a({ class: 'section-tab-nav-tab user-account-tab',
					id: 'user-account-data',
					href: '/requests/' },
				_if(manager, _("Documents and data"), _("My documents and data"))),
			div({ id: 'user-account-content', class: 'section-primary' }));

		insert(_if(!manager || eq(this.user._manager, manager), [
			h3({ class: 'user-account-section-title' }, _("Available services")),
			section({ class: 'section-primary' },
				ul({ class: 'user-account-service-boxes' },
					exports._servicesBoxList(this),
					function (item) {
						var disabled = item.disabledCondition
						  , renderAsForm = item.actionUrl != null ? and(item.actionUrl, not(disabled)) : false
						  , renderAsDiv = or(item.hrefUrl, disabled)
						  , boxClasses = [ 'user-account-service-box', _if(disabled, 'disabled') ];

						return li(_if(item.condition || true, _if(
							renderAsForm,
							form({ class: boxClasses, action: item.actionUrl, method: 'post' },
								button({ type: 'submit' }, _if(renderAsForm, item.buttonContent)),
								div(div({ class: 'free-form' }, _if(renderAsForm, item.content)),
									p(button({ type: 'submit' },
										i({ class: 'fa fa-angle-right' }), _('Click to start'))))),
							div({ class: boxClasses },
								a({ href: _if(disabled, null, item.hrefUrl) },
									_if(renderAsDiv, item.buttonContent)),
								div(div({ class: 'free-form' }, _if(renderAsDiv, item.content)),
									p(a({ href: _if(disabled, null, item.hrefUrl) },
										i({ class: 'fa fa-angle-right' }), _if(disabled,
											_('You have reached the draft limit for this service'),
											_('Click to start'))))))
						)));
					}))
		]));

	}
};

exports._servicesBoxList = Function.prototype;
