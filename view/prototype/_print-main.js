'use strict';

exports.body = function () {
	link({ href: '/prototype-print.css', rel: 'stylesheet' });
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
