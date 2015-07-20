'use strict';

exports._parent = require('./_user-main');

module.exports = exports = require('../../view/guide');

require('./_inventory');

exports._guideHeading = function () {
	return div({ class: 'capital-first' }, div("1"),
		div(h1("Individual registration guide for companies"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")));
};

exports._registrationIntro = function () {
	return p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
		" Etiam vestibulum dui mi, nec ultrices diam ultricies id. " +
		" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ");
};

exports._requirementsIntro = function () {
	return p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
		" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ");
};

exports._costsIntro = function () {
	return [div({ class: 'free-form' },
		p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
			" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
			" tortor felis, et sodales quam vulputate ac."),
		ul(
			li(
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
				ul(
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
				)
			),
			li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
			li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
		),
		ol(
			li(
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
				ol(
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
					li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
				)
			),
			li("Lorem ipsum dolor sit amet, consectetur adipiscing elit")
		),
		p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
			" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
			" tortor felis, et sodales quam vulputate ac.")),
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
			" Etiam vestibulum dui mi, nec ultrices diam ultricies id. ")];
};

exports._costsEnding = function () {
	return p(a({ class: 'button-resource-link', href: 'costs-print/', target: '_blank' },
			span({ class: 'fa fa-print' }), " ", "Print costs list"));
};
