'use strict';

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

exports._logo = Function.prototype;
