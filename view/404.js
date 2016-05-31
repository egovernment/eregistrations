'use strict';

var _ = require('mano').i18n.bind('View');

exports._parent = require('./base');

exports.main = function () {
	div(
		{ class: 'error-page content user-forms' },
		div(
			{ class: 'section-primary' },
			h1("#404"),
			h2(_("Page not found"))
		)
	);
};
