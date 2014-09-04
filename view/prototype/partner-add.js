'use strict';

var db = require('mano').db,
		user = db.User.prototype;

exports.step = function () {
	section(
		form({ class: 'content' },
			h1("Add new Partner"),
			fieldset(h2("Business Partner basic informations"),
				hr(),
				ul({ class: 'form-elements forms' },
					['firstName', 'lastName', 'dateOfBirth', 'userEmail'],
					function (name) { return field({ dbjs: user.getObservable(name) }); }
					),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit' }, "Submit")
					)
				)
			)
	);

	section(
		form({ class: 'content' },
				fieldset(h2("Business Partner secondary informations"),
					hr(),
					ul({ class: 'form-elements forms' },
						['companyType', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
						),
					p({ class: 'submit-placeholder' },
						input({ type: 'submit' }, "Submit")
						)
					)
				)
	);

	div({ class: 'next-step' },
			a({ href: '/forms/' }, "Save")
			);
};
