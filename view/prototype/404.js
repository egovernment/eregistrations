'use strict';

exports.main = function () {
	div({ class: 'error-page content user-forms' },
		div(
			{ class: 'section-primary' },
			h1("#404"),
			h2("We are very sorry, but it seems that page that You are looking for doesn't exist.")
		)
		);
};
