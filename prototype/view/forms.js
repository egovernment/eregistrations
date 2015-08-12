// Forms step page

'use strict';

module.exports = exports = require('../../view/business-process-data-forms');

exports._formsHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("2"),
		div(h1("Fill the form"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};
