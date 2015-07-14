'use strict';

exports.title = exports._title();

exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });
	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype-print.css'), rel: 'stylesheet' });
};

exports.body = function () {
	header(
		{ class: 'print-header' },
		exports._logo(),
		div(
			{ id: 'print-page-title' }
		)
	);
	hr();
	section({ id: 'main' });
};

exports._title = Function.prototype;
exports._configuration = Function.prototype;
exports._logo = Function.prototype;
