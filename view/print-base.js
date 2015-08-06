'use strict';

exports.body = function () {
	header(
		{ class: 'print-header' },
		exports._logo(),
		div({ class: 'print-header-title', id: 'print-page-title' })
	);
	hr();
	section({ id: 'main' });
};

exports._logo = Function.prototype;
