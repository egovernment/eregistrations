'use strict';

module.exports = exports = require('../../view/business-process-submission-forms');

exports._submissionHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("5"),
		div(h1("Send your file"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};
