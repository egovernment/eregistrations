'use strict';

var db = require('mano').db,
	userProto = db.User.prototype,
	_  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-base');

exports['sub-main'] = function (user, url) {
	div(
		{ class: 'content user-forms' },
		h1("User Profile"),
		div(
			{ class: 'section-primary' },
			h3("Basic informations"),
			hr(),
			section(
				form(
					fieldset({
						class: 'form-elements',
						dbjs: userProto,
						names: ['firstName', 'lastName'],
						control: { required: false },
						append: [
							li(field({ dbjs: userProto._email, disabled: true })),
							li(field({ dbjs: userProto._password,
								label: _("Current password"), name: 'password',
								required: false })),
							li(field({ dbjs: userProto._password,
								label: _("New password"),
								name: 'password-new', id: 'user-password-new',
								hint: _("Enter a new password (minimum 6 characters)."),
								required: false })),
							li(field(
								{
									label: _("Repeat new password"),
									dbjs: db.Password,
									name: 'password-repeat'
								}
							))
						]
					},
						p(
							{ class: 'submit-placeholder input' },
							input(
								{ type: 'submit' },
								"Save"
							)
						)
						)
				)
			)
		)
	);
};
