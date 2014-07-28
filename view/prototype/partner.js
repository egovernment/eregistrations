'use strict';

exports.step = function () {
	section(
		{ 'class': 'section-primary' },
		h2("Section A"),
		div(
			h3("Busieness Partner basic informations"),
			hr(),
			ul(
				{ 'class': 'entity-properties' },
				li(
					span({ 'class': 'entity-properties-name' }, "First name: "),
					span({ 'class': 'entity-properties-value' }, "John")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Last name: "),
					span({ 'class': 'entity-properties-value' }, "Wattson")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Date of birth: "),
					span({ 'class': 'entity-properties-value' }, "01-01-1870")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Email address: "),
					span({ 'class': 'entity-properties-value' }, "john.wattson@gamil.com")
				)
			)
		)
	);
	section(
		{ 'class': 'section-primary' },
		h2("Section B"),
		div(
			h3("Busieness Partner secondary informations"),
			hr(),
			ul(
				{ 'class': 'entity-properties' },
				li(
					span({ 'class': 'entity-properties-name' }, "Registration type: "),
					span({ 'class': 'entity-properties-value' }, "Private limited company")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Quantity of members: "),
					span({ 'class': 'entity-properties-value' }, "4")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Inventory value: "),
					span({ 'class': 'entity-properties-value' }, "1 000 000 ")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Owner of business premises: "),
					span({ 'class': 'entity-properties-value' }, "Sherlock Holmes")
				),
				li(
					span({ 'class': 'entity-properties-name' }, "Business activity: "),
					span({ 'class': 'entity-properties-value' }, "Re-assurance and endowmen")
				)
			)
		)
	);
	div({ 'class': 'nav-back' },
		a({ 'href': '/forms' }, "Back to forms")
		);
};
