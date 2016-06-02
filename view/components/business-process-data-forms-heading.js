'use strict';

var _ = require('mano').i18n.bind('View: Business Process');

module.exports = function () {
	var headingText = _("1 Fill the form");

	return div(
		{ class: 'capital-first' },
		div(headingText[0]),
		div(
			h1(headingText.slice(1).trim()),
			p(_("Answer all mandatory questions."))
		)
	);
};
