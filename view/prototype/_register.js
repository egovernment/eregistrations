'use strict';

var db = require('mano').db

  , user = db.User.prototype;

module.exports = modal(
	{ 'class': 'modal-register' },
	section(
		header(
			h3("Create your account")
		),
		div(
			form({ action: '/register/', method: 'post' },
				fieldset(['firstName', 'lastName', 'email', 'password'].map(function (name) {
					var rel = user._get(name);
					return p(input({ dbjs: rel, placeholder: rel.descriptor.label }),
						span("Error message"));
				}),
					p("Your password must be at least 6 characters and include at least one number."),
					p(input({ type: 'submit', value: "Create account" }))))
		),
		footer(
			p("Already has account?",
				a(" Log in  | "),
				a({ href: '/reset-password/' }, " Reset password"))
		)
	)
);
