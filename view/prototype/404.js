'use strict';

exports.main = function () {
	div({ class: 'public-error content user-forms' },
		div(
			{ class: 'section-primary' },
			h1({ class: 'error-type' }, "#404"),
			h2("We are very sorry, but it seems that page that You are looking for doesn't exist.")
		)
		);
};
