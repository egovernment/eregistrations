// Forms step page

'use strict';

module.exports = exports = require('../../view/forms');

exports._formsHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("2"),
		div(h1("Fill the form"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};

exports._errorInformation = function () {
	return p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first");
};

exports._mainInformation = function () {
	return [h3("Observation"),
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa."),
		ul(
			li(
				h4("Lorem ipsum dolor sit amet, consectetur adipiscing elit: "),
				p("Lorem ipsum dolor sit amet, consectetur")
			),
			li(
				h4("Lorem ipsum dolor sit amet, consectetur adipiscing elit: "),
				p("LoLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat aliquet massa," +
					" quis vulputate diam. Morbi non dolor ac tellus finibus commodo. Donec convallis" +
					" tortor felis, et sodales quam vulputate ac.")
			)
		),
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit")];
};
