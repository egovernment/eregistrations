'use strict';

var _              = require('mano').i18n.bind('View: Abstract User')
  , loginDialog    = require('./components/login-dialog')
  , registerDialog = require('./components/register-dialog')
  , modalContainer = require('./components/modal-container')
  , roleMenuItem   = require('./components/role-menu-item')
  , db             = require('../db');

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

	div({ id: 'sub-main-prepend' });

	div({ class: 'user-forms', id: 'sub-main' });
};

exports._extraRoleLabel = function () {
	return _if(or(this.manager, eq(this.user._currentRoleResolved, 'manager')), li(
		span(
			{ class: 'manager-label' },
			_("Notary")
		)
	));
};

var userNameMenuItem = function () {
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
				_if(user.flowRoles._size, user._currentRoleResolved.map(function (role) {
					if (!role) return;

					if (!db.Role.isFlowRole(role)) {
						return [
							li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
							li(form({ method: 'post', action: '/set-role/' },
								input({ type: 'hidden', name: user.__id__ + '/currentRole',
									value: user.flowRoles.first }),
								button({ type: 'submit' }, _("Roles"))))];
					}
					return [
						li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
						li({ class: 'header-top-menu-dropdown-item-active' },
							a({ href: '/' }, _("Roles")))];
				})),
				_if(user.roles._has('statistics'), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					roleMenuItem(this, 'statistics')
				]),
				_if(or(isMetaAdmin, isUsersAdmin), [
					li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
					_if(isMetaAdmin, roleMenuItem(this, 'metaAdmin')),
					_if(isUsersAdmin, roleMenuItem(this, 'usersAdmin'))
				]),
				li({ class: 'header-top-menu-dropdown-content-separator' }, hr()),
				li(
					a(
						{ href: '/profile/' },
						_("My informations")
					)
				),
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
