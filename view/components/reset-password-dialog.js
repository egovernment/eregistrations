'use strict';

var db        = require('mano').db
  , _         = require('mano').i18n.bind('Reset password')
  , userProto = db.User.prototype;

module.exports = dialog(
	{ id: 'reset-password', class: 'dialog-reset-password dialog-modal' },
	header(
		h3(_("Reset password"))
	),
	section(
		{ class: 'dialog-body' },
		form(
			{ action: '/request-reset-password/', method: 'post' },
			ul(
				{ class: 'form-elements' },
				li(
					{ class: 'input' },
					label(
						span({ class: 'placeholder-fallback' }, userProto.getDescriptor('email').label),
						input({ dbjs: db.Email, required: true, name: 'email',
							placeholder: userProto.getDescriptor('email').label })
					)
				)
			),
			p({ class: 'success-message' }),
			p(input({ type: 'submit', value: _("Reset") }))
		)
	)
);
