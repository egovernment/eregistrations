'use strict';

var _  = require('mano').i18n.bind('User');

exports._parent = require('./base');

exports.menu = function () {
	insert(_if(this.user._isDemo,
		div(
			{ class: 'submitted-menu-demo-info-wrapper' },
			ul({ class: 'header-top-menu-demo' },
				li(a({ class: 'demo-public-out', href: '/logout/', rel: 'server' }, _("Out of demo mode"))),
				li(a({ class: 'demo-public-login', href: '#login' }, _("Login")))),
			div({ class: 'submitted-menu-demo-info' },
				p(_("Did this demo convinced you?")),
				a({ href: '#create-account' }, _("Create account")))
		),
		ul(
			{ class: 'header-top-menu' },
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'fa fa-user' }, "Preferences")
				)
			),
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'header-top-user-name' }, this.user._fullName)
				)
			),
			li(
				a(
					{ href: '/profile/' },
					span({ class: 'fa fa-cogs' }, "Preferences")
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
	div({ class: 'user-forms', id: 'sub-main' });
};

exports._submittedMenu = Function.prototype;
