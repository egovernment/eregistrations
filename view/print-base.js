// Base for print view
//
// This view is meant to be additionally customised per eregistrations system,
// for full picture of configuration, be sure to visit customisation module
// in system you're working at (most likely placed at /view/print-base.js)

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
