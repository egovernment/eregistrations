'use strict';

module.exports = exports = require('../../view/documents');

exports._documentsHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("3"),
		div(h1("Upload Your Documents"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};
