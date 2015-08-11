// Prototype payment user page (Part A)

'use strict';

module.exports = exports = require('../../view/business-process-payment');

exports._paymentHeading = function () {
	return div(
		{ class: 'capital-first' },
		div("4"),
		div(h1("Make payment"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);
};
