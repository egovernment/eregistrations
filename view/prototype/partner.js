'use strict';

exports.step = function () {
	section(
		{ 'class': 'section-primary' },
		h2("Section A"),
		div(
			h3("Busieness Partner basic informations"),
			hr(),
			ul(
				{ 'class': 'property-list' },
				li(
					span({ 'class': 'property-name' }, "First name: "),
					span({ 'class': 'property-value' }, "John")
				),
				li(
					span({ 'class': 'property-name' }, "Last name: "),
					span({ 'class': 'property-value' }, "Wattson")
				),
				li(
					span({ 'class': 'property-name' }, "Date of birth: "),
					span({ 'class': 'property-value' }, "01-01-1870")
				),
				li(
					span({ 'class': 'property-name' }, "Email address: "),
					span({ 'class': 'property-value' }, "john.wattson@gamil.com")
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
				{ 'class': 'property-list' },
				li(
					span({ 'class': 'property-name' }, "Registration type: "),
					span({ 'class': 'property-value' }, "Private limited company")
				),
				li(
					span({ 'class': 'property-name' }, "Quantity of members: "),
					span({ 'class': 'property-value' }, "4")
				),
				li(
					span({ 'class': 'property-name' }, "Inventory value: "),
					span({ 'class': 'property-value' }, "1 000 000 ")
				),
				li(
					span({ 'class': 'property-name' }, "Owner of business premises: "),
					span({ 'class': 'property-value' }, "Sherlock Holmes")
				),
				li(
					span({ 'class': 'property-name' }, "Business activity: "),
					span({ 'class': 'property-value' }, "Re-assurance and endowmen")
				)
			)
		)
	);
	div({ 'class': 'naviagate-back' },
		a({ 'href': '/forms' }, "Back to forms")
		);
};
