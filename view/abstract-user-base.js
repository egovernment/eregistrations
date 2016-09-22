'use strict';

var _                    = require('mano').i18n.bind('View: User')
  , loginDialog          = require('./components/login-dialog')
  , registerDialog       = require('./components/register-dialog')
  , modalContainer       = require('./components/modal-container')
  , requestAccountDialog = require('./components/request-account-dialog');

exports._parent = require('./base');

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
			list(exports._menuItems, function (item) { return item.call(this); }.bind(this))
		)));
};

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'submitted-menu-bar content' },
			nav(ul({ class: 'submitted-menu-items', id: 'submitted-menu' })),
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
};

exports._getRoleMenuItem    = Function.prototype;
exports._getMyAccountButton = Function.prototype;

exports._extraRoleLabel = function () {
	return _if(or(this.manager, eq(this.user._currentRoleResolved, 'manager')), li(
		span(
			{ class: 'manager-label' },
			_("Notary")
		)
	));
};

exports._profileMenuItem = function () {
	return li(
		a(
			{ href: '/profile/' },
			_("My informations")
		)
	);
};

exports._logoutMenuItem = function () {
	return li(
		a(
			{ href: '/logout/', rel: 'server' },
			_("Log out")
		)
	);
};

exports._userNameMenuItem = function () {
	var user         = this.manager || this.user
	  , isMetaAdmin  = user.roles._has('metaAdmin')
	  , isUsersAdmin = user.roles._has('usersAdmin');

	return [
		li(
			{ id: "drop-down-menu", class: "header-top-dropdown-container" },
			a(span({ class: 'header-top-user-name header-top-dropdown-button' },
				user._fullName,
				i({ id: 'drop-down-menu-angle', class: 'fa fa-angle-down header-top-dropdown-button' }))),
			ul(
				{ class: "header-top-menu-dropdown-content" },
				_if(user.roles._has('statistics'), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					exports._getRoleMenuItem.call(this, 'statistics')
				]),
				_if(or(isMetaAdmin, isUsersAdmin), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					_if(isMetaAdmin, exports._getRoleMenuItem.call(this, 'metaAdmin')),
					_if(isUsersAdmin, exports._getRoleMenuItem.call(this, 'usersAdmin'))
				]),
				li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
				exports._profileMenuItem.call(this),
				exports._logoutMenuItem.call(this)
			)
		),
		script(function () {
			var dropDownMenu      = $('drop-down-menu')
			  , dropDownMenuAngle = $('drop-down-menu-angle');

			dropDownMenu.onclick = function () {
				if (dropDownMenu.hasClass("header-top-menu-opened")) {
					dropDownMenu.removeClass("header-top-menu-opened");
					dropDownMenuAngle.removeClass("fa-angle-up");
					dropDownMenuAngle.addClass("fa-angle-down");
				} else {
					dropDownMenu.addClass("header-top-menu-opened");
					dropDownMenuAngle.addClass("fa-angle-up");
					dropDownMenuAngle.removeClass("fa-angle-down");
				}
			};

			document.onclick = function (event) {
				var evt = event || window.event;
				var clicked = null;
				if (typeof evt.target !== 'undefined') {
					clicked = $(evt.target);
				} else {
					clicked = $(evt.srcElement);
				}
				if (!clicked.hasClass('header-top-dropdown-button')) {
					dropDownMenu.removeClass("header-top-menu-opened");
					dropDownMenuAngle.removeClass("fa-angle-up");
					dropDownMenuAngle.addClass("fa-angle-down");
				}
			};
		})
	];
};

exports._menuItems = [
	exports._extraRoleLabel,
	exports._userNameMenuItem
];
