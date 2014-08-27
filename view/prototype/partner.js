'use strict';

var db = require('mano').db,
	partner = db.partnerFrank;

exports.step = function () {
	section(
		{ class: 'section-primary' },
		h1("Partner: " + partner._firstName + " " + partner._lastName),
		div(
			h2("Busieness Partner basic informations"),
			hr(),
			ul(
				{ class: 'entity-properties' },
				li(
					span({ class: 'entity-properties-name' }, "First name: "),
					span({ class: 'entity-properties-value' }, partner._firstName)
				),
				li(
					span({ class: 'entity-properties-name' }, "Last name: "),
					span({ class: 'entity-properties-value' }, partner._lastName)
				),
				li(
					span({ class: 'entity-properties-name' }, "Date of birth: "),
					span({ class: 'entity-properties-value' }, partner._dateOfBirth)
				),
				li(
					span({ class: 'entity-properties-name' }, "Email address: "),
					span({ class: 'entity-properties-value' }, partner.email)
				)
			)
		)
	);
	section(
		{ class: 'section-primary' },
		div(
			h2("Busieness Partner secondary informations"),
			hr(),
			ul(
				{ class: 'entity-properties' },
				li(
					span({ class: 'entity-properties-name' }, "Registration type: "),
					span({ class: 'entity-properties-value' }, partner.companyType)
				),
				li(
					span({ class: 'entity-properties-name' }, "Quantity of members: "),
					span({ class: 'entity-properties-value' }, partner.members)
				),
				li(
					span({ class: 'entity-properties-name' }, "Inventory value: "),
					span({ class: 'entity-properties-value' }, partner.inventory)
				),
				li(
					span({ class: 'entity-properties-name' }, "Owner of business premises: "),
					span({ class: 'entity-properties-value' }, partner.isOwner)
				),
				li(
					span({ class: 'entity-properties-name' }, "Business activity: "),
					span({ class: 'entity-properties-value' }, partner.businessActivity)
				)
			)
		)
	);
	div({ class: 'nav-back' },
		a({ href: '/forms/' }, "Back to forms")
		);
};
