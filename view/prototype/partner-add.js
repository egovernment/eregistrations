'use strict';

var db = require('mano').db,
		user = db.User.prototype;

exports.step = function () {
	section(
		form({ class: 'section-primary' },
			h1("Add new Partenr"),
			fieldset(h2("Busieness Partner basic informations"),
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
		form({ class: 'section-primary' },
				fieldset(h2("Busieness Partner secondary informations"),
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
