'use strict';

exports.body = function () {
	header(
		{ class: 'print-header' },
		exports._logo(),
		div({ class: 'print-header-title', id: 'print-page-title' }, h2(exports._officialRoleName()))
	);
	hr();
	section({ id: 'main' });
};

exports._logo = Function.prototype;
exports._officialRoleName = Function.prototype;
