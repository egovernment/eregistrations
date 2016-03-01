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

	insert(_if(this.manager, function () {
		var managedUser = this.manager.currentlyManagedUser;
		return div({ class: 'manager-bar' },
			div({ class: 'content' },
				div({ class: 'manager-bar-info' },
					span(_("Client"), ": "),
					exports._getMyAccountButton(this.manager, managedUser._fullName),
					" ",
					a({ href: '/managed-user-profile/' }, _("edit user details"))
					),
				div({ class: 'manager-bar-actions' },
					_if(not(managedUser.roles._has('user')),
						postButton({ buttonClass: 'actions-create',
							action: url('request-create-managed-account', managedUser.__id__),
							confirm: _if(managedUser._isInvitationSent,
								_("Invitation was already send to user. Are you sure you want to send it again?")),
							value: span(_('Create account for this client')) })))
				));
	}.bind(this)));

	div({ class: 'user-forms', id: 'sub-main' });
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
