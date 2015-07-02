'use strict';

var _  = require('mano').i18n.bind('Registration'),
	db = require('mano').db,
	userProto = db.User.prototype,
	baseUrl = url;

exports._parent = require('./user-base');

exports['sub-main'] = function () {

	var url = baseUrl.bind(this.root);

	div(
		{ class: 'content user-forms' },
		h1(_("User Profile")),
		div(
			{ class: 'section-primary' },
			h3(_("Account Information")),
			hr(),
			section(
				form({ action: url('profile'), method: 'post' },
					fieldset({
						class: 'form-elements',
						dbjs: this.user,
						names: ['firstName', 'lastName'],
						control: { required: false },
						append: [
							li(field({ dbjs: this.user._email, disabled: true })),
							li(field({ dbjs: userProto._password,
								label: _("Current password"), name: 'password',
								required: false })),
							li(field({ dbjs: userProto._password,
								label: _("New password"),
								name: 'password-new', id: 'user-password-new',
								hint: _("Enter a new password (minimum 6 characters)."),
								required: false })),
							li(field({
								label: _("Repeat new password"),
								dbjs: db.Password,
								name: 'password-repeat'
							}))
						]
					}),
					p({ class: 'dbjs-component-message success-message' }),
					p({ class: 'submit-placeholder input' },
						input({ type: 'submit', value: _("Save") })))
			)
		)
	);
};
