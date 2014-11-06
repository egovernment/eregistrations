'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports.certificates = function () {
	form(
		{ method: 'post', class: 'form-elements ' },
		div(
			{ class: 'sub-section' },
			h3("Upload here the certificates:"),
			fieldset(
				ul(
					li(
						div(
							{ class: 'dbjs-input-component' },
							label(user.getDescriptor('firstName').label),
							div(
								{ class: 'input' },
								input({ dbjs: user._firstName })
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component' },
							div(
								{ class: 'input' },
								input({ dbjs: user._incorporationCertificateFile })
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component' },
							label(user.getDescriptor('dateOfBirth').label),
							div(
								{ class: 'input' },
								input({ dbjs: user._dateOfBirth })
							)
						)
					),
					li(
						div(
							{ class: 'dbjs-input-component' },
							div(
								{ class: 'input' },
								input({ dbjs: user._registeredArticlesFile })
							)
						)
					)
				)
			)
		)
	);
};
