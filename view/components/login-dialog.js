'use strict';

var db        = require('mano').db
  , _         = require('mano').i18n.bind('View: Component: Login dialog')
  , userProto = db.User.prototype;

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
					{ class: 'input' },
					label(
						span({ class: 'placeholder-fallback' }, userProto.getDescriptor('email').label),
						input({ dbjs: db.Email, required: true, name: 'email',
							placeholder: userProto.getDescriptor('email').label })
					)
				),
				li(
					{ class: 'input' },
					label(
						span({ class: 'placeholder-fallback' }, userProto.getDescriptor('password').label),
						input({ dbjs: db.Password, required: true, name: 'password',
							placeholder: userProto.getDescriptor('password').label })
					),
					span({ class: 'error-message' })
				)
			),
			p(input({ type: 'submit', value: _("Sign In") }))
		)
	),
	footer(
		p(_("No account?"), ' ',
			a({ href: '#register' }, _("Create an account")),
			span(" | "),
			a({ href: '#reset-password' }, _("Reset password")))
	)
);
