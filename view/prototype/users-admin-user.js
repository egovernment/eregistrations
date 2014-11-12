'use strict';

var db = require('mano').db,
	user = db.userVianney;

exports['sub-main'] = function () {
	div(
		{ class: 'section-primary' },
		div(
			{ class: 'entity-header' },
			h3("User: " + user._firstName + " " + user._lastName),
			div(
				{ class: 'entity-actions' },
				a({ href: '/users-admin/edit-user-id/' }, "Edit", span({ class: 'fa fa-edit' }, "Edit")),
				postButton({ value: ["Delete", span({ class: 'fa fa-trash-o' }, "Delete")] })
			)
		),
		hr(),
		ul(
			{ class: 'entity-properties' },
			li(
				span({ class: 'entity-properties-name' }, "First name: "),
				span({ class: 'entity-properties-value' }, user._firstName)
			),
			li(
				span({ class: 'entity-properties-name' }, "Last name: "),
				span({ class: 'entity-properties-value' }, user._lastName)
			),
			li(
				span({ class: 'entity-properties-name' }, "Roles:"),
				span({ class: 'entity-properties-value' }, user._roles)
			),
			li(
				span({ class: 'entity-properties-name' }, "Email address: "),
				span({ class: 'entity-properties-value' }, user._email)
			)
		)
	);
};
