'use strict';

var db        = require('mano').db
  , _         = require('mano').i18n.bind('Register')
  , userProto = db.User.prototype

  , registrationInputNames = ['firstName', 'lastName', 'email', 'password', 'password-repeat'];

module.exports = function () {
	var user = this.user || userProto;

	return dialog(
		{ id: 'register', class: 'dialog-register dialog-modal' },
		header(
			h3(_("Create your account"))
		),
		section(
			{ class: 'dialog-body' },
			form(
				{ action: '/register/', method: 'post' },
				ul({ class: 'form-elements' }, registrationInputNames.map(function (name) {
					var rel = user._get(name), labelElement;

					if (name === 'password-repeat') {
						labelElement = label(
							input({
								dbjs: db.Password,
								name: name,
								required: true,
								placeholder: _("Repeat password")
							})
						);
					} else {
						labelElement = label(
							span({ class: 'placeholder-fallback' }, rel.descriptor.label),
							input({ dbjs: rel, placeholder: rel.descriptor.label })
						);
					}

					return li({ class: 'dbjs-input-component input' },
						labelElement,
						span({ class: 'error-message' }));
				})),
				p(input({ type: 'submit', value: _("Create an account") }))
			)
		),
		footer(
			p(_("Already has account?"), ' ', a({ href: '#login' }, _("Log in")))
		)
	);
};
