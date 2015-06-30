'use strict';

exports.title = "eRegistrations: Prototype demo print";

exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });
	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype-print.css'), rel: 'stylesheet' });
};

exports.body = function () {
	header(
		{ class: 'print-header' },
		img({ src: '/img/logo-2.png' }),
		div(
			{ id: 'print-page-title' }
		)
	);
	hr();
	section({ id: 'main' });
};
