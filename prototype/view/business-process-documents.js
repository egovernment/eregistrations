// Prototype documents user page (Part A)

'use strict';

module.exports = exports = require('../../view/business-process-documents');

exports._documentsHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("3"),
		div(h1("Upload Your Documents"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};
