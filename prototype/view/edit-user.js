'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	Set = require('es6-set'),
	filterOfficial = require('../../model/filter-official-roles');

exports._parent = require('./users-admin');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		form(
			fieldset(
				{ class: 'section-primary' },
				h3("Edit user"),
				hr(),
				ul({ class: 'form-elements' },
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
					{ class: 'submit-placeholder input' },
					input(
						{ type: 'submit' },
						"Save"
					)
				)
			)
		);
	}
};
