'use strict';

var db    = require('mano').db
  , _     = require('mano').i18n.bind('Login')
  , user  = db.User.prototype;

module.exports = dialog(
	{ id: 'login', class: 'dialog-login dialog-modal' },
	header(
		h3(_("Login"))
	),
	section(
		{ class: 'dialog-body' },
		form(
			{ action: '/login/', method: 'post' },
			ul(
				{ class: 'form-elements' },
				li(
					{ class: 'dbjs-input-component input' },
					label(
						span({ class: 'placeholder-fallback' }, user.getDescriptor('email').label),
						input({ dbjs: db.Email, required: true, name: 'email',
							placeholder: user.getDescriptor('email').label })
						)
					),
				li(
					{ class: 'dbjs-input-component input' },
					label(
						span({ class: 'placeholder-fallback' }, user.getDescriptor('password').label),
						input({ dbjs: db.Password, required: true, name: 'password',
							placeholder: user.getDescriptor('password').label })
						),
					span({ class: 'error-message' }))
				),
			p(input({ type: 'submit', value: _("Sign In") }))
		)
	),
	footer(
		p(_("No account?"), ' ',
			a({ href: '#register' }, _("Create an account")),
			span(" | "),
			a({ href: "#reset-password" }, _("Reset password")))
	)
);
