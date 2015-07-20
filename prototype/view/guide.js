'use strict';

exports._parent = require('./_user-main');

module.exports = exports = require('../../view/guide');

require('./_inventory');

exports._guideHeading = function () {
	return div({ class: 'capital-first' }, div("1"),
		div(h1("Individual registration guide for companies"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")));
};
