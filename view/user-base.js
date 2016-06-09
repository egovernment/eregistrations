'use strict';

var _                    = require('mano').i18n.bind('View: User')
  , loginDialog          = require('./components/login-dialog')
  , registerDialog       = require('./components/register-dialog')
  , modalContainer       = require('./components/modal-container')
  , requestAccountDialog = require('./components/request-account-dialog')
  , okayNav              = require('./utils/okay-nav');

exports._parent = require('./base');

exports._extraRoleLabel = function () {
	return _if(or(this.manager, eq(this.user._currentRoleResolved, 'manager')), li(
		span(
			{ class: 'manager-label' },
			_("Notary")
		)
	));
};

exports.menu = function () {
	modalContainer.append(loginDialog);
	modalContainer.append(registerDialog(this));

	insert(_if(this.user._isDemo,
		div(
			{ class: 'submitted-menu-demo-info-wrapper' },
			ul({ class: 'header-top-menu-demo' },
				li(a({ class: 'demo-public-out', href: '/logout/', rel: 'server' }, _("Out of demo mode"))),
				li(a({ class: 'demo-public-login', href: '#login' }, _("Log in")))),
			div({ class: 'submitted-menu-demo-info' },
				p(_("Did this demo convinced you?")),
				a({ href: '#register' }, _("Create account")))
		),
		ul(
			{ class: 'header-top-menu' },
			exports._extraRoleLabel.call(this),
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'header-top-user-name' },
						this.manager ? this.manager._fullName : this.user._fullName)
				)
			),
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'fa fa-cog' }, "Preferences")
				)
			),
			li(
				a(
					{ href: '/logout/', rel: 'server' },
					span({ class: 'fa fa-power-off' }, "Log out")
				)
			)
		)));
};

exports.main = function () {
	var mainNav;
	div({ class: 'submitted-menu' },
		div({ class: 'submitted-menu-bar content' },
			nav(
				mainNav = ul({ class: 'submitted-menu-items', id: 'submitted-menu' },
					exports._submittedMenu.call(this))
			),
			_if(this.user._isDemo, div({ class: 'submitted-menu-demo' },
				a({ class: 'submitted-menu-demo-ribon' }, _("Demo"))))));

	insert(_if(this.user._isDemo,
		div({ class: 'submitted-menu-demo-msg' },
			div({ class: 'content' },
				h3(_("Demo version")),
				p(_("Introduction to demo version"))))));

	insert(_if(this.manager, function () {
		return this.manager._currentlyManagedUser.map(function (managedUser) {
			if (!managedUser) return;
			var isUserReallyManaged = eq(this.manager, managedUser._manager);

			requestAccountDialog(managedUser);

			return div({ class: 'manager-bar' },
				div({ class: 'content' },
					div({ class: 'manager-bar-info' },
						span(_("Client"), ": "),
						this.appName === 'user' ? a({ href: '/' }, managedUser._fullName)
						: exports._getMyAccountButton(this.manager, managedUser._fullName)),
					_if(isUserReallyManaged, div({ class: 'manager-bar-actions' },
						_if(not(managedUser._isActiveAccount),
							a({
								class: 'actions-create',
								href: '#request-create-account'
							}, span(_('Create account for this client')))),
						a({ href: '/managed-user-profile/' },
							span({ class: 'hint-optional hint-optional-left',
								'data-hint': _('edit user details') },
								i({ class: 'fa fa-cog' })))))));
		}.bind(this));
	}.bind(this)));

	div({ class: 'user-forms', id: 'sub-main' });

	okayNav(mainNav);

};

exports._submittedMenu = Function.prototype;

exports._getMyAccountButton = function (user, fullName) {
	return form({ method: 'post', action: '/change-business-process/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		button({ type: 'submit' }, fullName));
};

exports._getManagerButton = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-currently-managed-user/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		input({ type: 'hidden',
			name: user.__id__ + '/currentlyManagedUser', value: null }),
		button({ type: 'submit' }, roleTitle));
};
