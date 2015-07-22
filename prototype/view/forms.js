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
