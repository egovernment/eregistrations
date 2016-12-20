'use strict';

var _ = require('mano').i18n.bind('View');

exports._parent = require('./user-base');

exports['sub-main'] = function () {
	div(
		{ class: 'error-page content user-forms' },
		div(
			{ class: 'section-primary' },
			h1("#404"),
			h2(_("Page not found"))
		)
	);
};
