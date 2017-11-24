'use strict';

var _                      = require('mano').i18n.bind('View: User')
  , env                    = require('mano').env
  , startsWith             = require('es5-ext/string/#/starts-with')
  , uncapitalize           = require('es5-ext/string/#/uncapitalize')
  , loginDialog            = require('./components/login-dialog')
  , registerDialog         = require('./components/register-dialog')
  , modalContainer         = require('./components/modal-container')
  , roleMenuItem           = require('./components/role-menu-item')
  , requestAccountDialog   = require('./components/request-account-dialog')
  , greedy                 = require('./utils/greedy-menu')
  , db                     = require('../db')
  , externalAuthentication = (env && env.externalAuthentication) || {};

exports._parent = require('./base');

var myAccountButton = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-business-process/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		button({ type: 'submit' }, roleTitle));
};

exports.menu = function () {
	if (!externalAuthentication.loginPage) {
		modalContainer.append(loginDialog);
	}

	if (!externalAuthentication.registerPage) {
		modalContainer.append(registerDialog(this));
	}

	insert(_if(this.user._isDemo,
		div(
			{ class: 'submitted-menu-demo-info-wrapper' },
			ul(
				{ class: 'header-top-menu-demo' },
				li(a({ class: 'demo-public-out', href: '/logout/', rel: 'server' }, _("Out of demo mode"))),
				li(_if(
					externalAuthentication.loginPage,
					a({ class: 'demo-public-login', href: externalAuthentication.loginPage, rel: 'server' },
						_("Log in")),
					a({ class: 'demo-public-login', href: '#login' }, _("Log in"))
				))
			),
			div(
				{ class: 'submitted-menu-demo-info' },
				p(_("Did this demo convinced you?")),
				_if(
					externalAuthentication.registerPage,
					a({ href: externalAuthentication.registerPage, rel: 'server' }, _("Create account")),
					a({ href: '#register' }, _("Create account"))
				)
			)
		),
		ul(
			{ class: 'header-top-menu' },
			list(exports._menuItems, function (item) { return item.call(this); }.bind(this))
		)));
};

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'submitted-menu-bar content' },
			this.user._currentRoleResolved.map(function (role) {
				var greedyElement = nav({ class: 'greedy-menu' },
					button({ class: 'toggle-links' }, i({ class: 'fa fa-bars' })),
					ul({ class: 'submitted-menu-items greedy-menu-items', id: 'submitted-menu' },
						exports._submittedMenu.call(this))
					);
				greedy({ element: greedyElement, counter: true });
				return greedyElement;
			}.bind(this)),
			_if(this.user._isDemo, div({ class: 'submitted-menu-demo' },
				a({ class: 'submitted-menu-demo-ribon' }, _("Demo"))))));

	div({ id: 'sub-main-prepend' },
		insert(_if(this.user._isDemo,
			div({ class: 'submitted-menu-demo-msg' },
				div({ class: 'content' },
					exports._demoBannerContent.call(this))))),

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
								: myAccountButton(this.manager, managedUser._fullName)),
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
		}.bind(this))),

		insert(exports._subMainPrependExtraItems.call(this)));

	div({ class: 'user-forms', id: 'sub-main' });
};

exports._submittedMenu = function () {
	var user = this.manager || this.user, isOfficialRole;
	// user.currentRoleResolved may not be resolved yet...
	if (!user.currentRoleResolved) {
		return;
	}
	if (user.currentRoleResolved === 'statistics') {
		return [li({ id: 'dashboard-nav' }, a({ href: '/' }, _("Dashboard"))),
			li({ id: 'dashboard-old-nav' }, a({ href: '/dashboard-old/' }, _("Dashboard old"))),
			li({ id: 'files-nav' }, a({ href: '/files/certificates-issued/' }, _("Files"))),
			li({ id: 'time-nav' }, a({ href: '/time/' }, _("Times"))),
			li({ id: 'rejections-nav' }, a({ href: '/rejections/' }, _("Reasons of rejections"))),
			li({ id: 'accounts-nav' }, a({ href: '/accounts/' }, _("Accounts"))),
			li({ id: 'old-nav' }, a({ href: '/old/' }, _("Old")))];
	}

	isOfficialRole = user.officialRoles.has(user.currentRoleResolved);
	return isOfficialRole ? list(user.officialRoles, exports._getSubmittedMenuItem.bind(this)) :
			exports._getSubmittedMenuItem.call(this, user.currentRoleResolved);
};

exports._getSubmittedMenuItem = function (role) {
	var user      = this.manager || this.user
	  , appName   = this.appName
	  , roleTitle = db.Role.meta[role].label
	  , viewPath, pending, pendingCount;

	if (role === 'user' && startsWith.call(appName, 'business-process-')) {
		return li(myAccountButton(user, roleTitle));
	}

	if (startsWith.call(role, 'official')) {
		viewPath = exports._getPendingViewPath.call(this, role);

		if (viewPath) {
			pending  = db.views.businessProcesses.getBySKeyPath(viewPath);

			if (pending && pending.pending) {
				pendingCount = pending.pending._totalSize;
			} else {
				pendingCount = '-';
			}
		} else {
			pendingCount = '-';
		}

		if (user.currentRoleResolved === role) {
			return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle,
				' (', pendingCount, ')'));
		}

		return li(form({ method: 'post', action: '/set-role/' },
			input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
			button({ type: 'submit' }, roleTitle, ' (', pendingCount, ')')));
	}

	if (user.currentRoleResolved === role) {
		if (user.currentRoleResolved === 'manager') {
			if (appName === 'manager' || appName === 'manager-registration') {
				return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle));
			}
			return li({ class: 'submitted-menu-item-active' },
				exports._getManagerButton(user, roleTitle));
		}
		return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle));
	}

	return li(form({ method: 'post', action: '/set-role/' },
		input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
		button({ type: 'submit' }, roleTitle)));
};

exports._getPendingViewPath = function (role) {
	return uncapitalize.call(role.slice('official'.length));
};

exports._subMainPrependExtraItems = Function.prototype;

exports._extraRoleLabel = function () {
	return _if(or(this.manager, eq(this.user._currentRoleResolved, 'manager')), li(
		span(
			{ class: 'manager-label' },
			_("Notary")
		)
	));
};

exports._getManagerButton = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-currently-managed-user/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		input({ type: 'hidden',
			name: user.__id__ + '/currentlyManagedUser', value: null }),
		button({ type: 'submit' }, roleTitle));
};

var userNameMenuItem = function () {
	var user         = this.manager || this.user;

	return [
		li(
			{ id: "drop-down-menu", class: "header-top-dropdown-container" },
			a(span({ class: 'header-top-user-name header-top-dropdown-button' },
				user._fullName,
				i({ id: 'drop-down-menu-angle', class: 'fa fa-angle-down header-top-dropdown-button' }))),
			ul(
				{ class: "header-top-menu-dropdown-content" },
				_if(user.officialRoles._size, user._currentRoleResolved.map(function (role) {
					if (!role) return;

					if (!db.Role.isOfficialRole(role)) {
						return [
							li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
							li(form({ method: 'post', action: '/set-role/' },
								input({ type: 'hidden', name: user.__id__ + '/currentRole',
									value: user.officialRoles.first }),
								button({ type: 'submit' }, _("Roles"))))];
					}
					return [
						li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
						li({ class: 'header-top-menu-dropdown-item-active' },
							a({ href: '/' }, _("Roles")))];
				})),
				_if(or(user.roles._has('user'), user.roles._has('manager')), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					roleMenuItem(this, 'user'),
					roleMenuItem(this, 'manager')
				]),
				_if(or(user.roles._has('inspector'), user.roles._has('supervisor'),
						user.roles._has('dispatcher'), user.roles._has('managerValidation')), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					roleMenuItem(this, 'dispatcher'),
					roleMenuItem(this, 'inspector'),
					roleMenuItem(this, 'supervisor'),
					roleMenuItem(this, 'managerValidation')
				]),
				_if(user.roles._has('statistics'), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					roleMenuItem(this, 'statistics')
				]),
				_if(or(user.roles._has('metaAdmin'), user.roles._has('usersAdmin')), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					roleMenuItem(this, 'metaAdmin'),
					roleMenuItem(this, 'usersAdmin')
				]),
				li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
				li(_if(
					and(externalAuthentication.profilePage, not(eq(user._currentRoleResolved, 'manager'))),
					a({ href: externalAuthentication.profilePage, target: '_blank' }, _("My informations")),
					a({ href: '/profile/' }, _("My informations"))
				)),
				li(
					a(
						{ href: '/logout/', rel: 'server' },
						_("Log out")
					)
				)
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
	userNameMenuItem
];

exports._demoBannerContent = function () {
	return [h3(_("Demo version")),
		p(_("Introduction to demo version"))];
};
