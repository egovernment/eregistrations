'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	Set = require('es6-set'),
	filterOfficial = require('../../model/filter-official-roles');

exports['sub-main'] = function () {
	section(
		form(
			{ class: 'section-primary' },
			fieldset(
				h3("Edit user"),
				hr(),
				ul({ class: 'form-elements fieldset' },
					li(field({ dbjs: user._firstName })),
					li(field({ dbjs: user._lastName })),
					li(field({ dbjs: user._roles,
							multiple: false,
							only: new Set(['users-admin', 'meta-admin', 'demo-user', 'user']),
							append: option({ value: 'official' }, "Official")
								}
								)
						),
					li(field({ dbjs: user._roles,
							filter: filterOfficial,
							label: 'Officials'
							}
							)
						),
					li(field({ dbjs: user._email })),
					li(field({ dbjs: user._password }))
					),
				p(
					{ 'class': 'submit-placeholder' },
					input(
						{ 'type': 'submit' },
						"Save"
					)
				)
			)
		)
	);
};
