'use strict';

var db = require('mano').db

  , user = db.User.prototype;

module.exports = modal(h4("Create your account"),
	form({ action: '/register/', method: 'post' },
		fieldset(['firstName', 'lastName', 'email', 'password'].map(function (name) {
			var rel = user._get(name);
			return p(input({ dbjs: rel, placeholder: rel.descriptor.label }),
				span("Error message"));
		}),
			p("Your password must be at least 6 caracters and include at least one number."),
			p(input({ type: 'submit', value: "Create account" })))));
