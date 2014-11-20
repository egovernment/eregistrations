'use strict';

exports.body = function () {
	link({ href: '/prototype-print.css', rel: 'stylesheet' });
	header(
		{ class: 'print-header' },
		img({ src: '/img/logo-2.png' }),
		div(
			h2("Revision"),
			p("19/11/2015")
		)
	);
	hr();
	section({ id: 'main' });
};
