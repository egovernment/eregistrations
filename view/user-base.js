'use strict';

var _              = require('mano').i18n.bind('User')
  , loginDialog    = require('./_user-login-dialog')
  , registerDialog = require('./_user-register-dialog')
  , modalContainer = require('./_modal-container');

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
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'header-top-user-name' }, this.user._fullName)
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

	div({ class: 'submitted-menu' },
		div({ class: 'submitted-menu-bar content' },
			nav(ul({ class: 'submitted-menu-items', id: 'submitted-menu' },
				exports._submittedMenu(this))),
			_if(this.user._isDemo, div({ class: 'submitted-menu-demo' },
				a({ class: 'submitted-menu-demo-ribon' }, _("Demo"))))));

	insert(_if(this.user._isDemo,
		div({ class: 'submitted-menu-demo-msg' },
			div({ class: 'content' },
				h3(_("Demo version")),
				p(_("Introduction to demo version"))))));

	insert(_if(this.managedUser, function () {
		return div({ class: 'manager-bar' },
			div({ class: 'content' },
				div({ class: 'manager-bar-info' },
					span(_("Client"), ": "),
					span(this.managedUser._fullName)),
				div({ class: 'manager-bar-actions' },
					_if(not(this.managedUser.roles._has('user')),
						postButton({ buttonClass: 'actions-create',
							action: url('clients', this.managedUser.__id__, 'create'),
							value: span(_('Create account for this client')) })))
				));
	}.bind(this)));

	div({ class: 'user-forms', id: 'sub-main' });
};

exports._submittedMenu = Function.prototype;
