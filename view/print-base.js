// Base for print view
//
// This view is meant to be additionally customised per eregistrations system,
// for full picture of configuration, be sure to visit customisation module
// in system you're working at (most likely placed at /view/print-base.js)

'use strict';

var db = require('mano').db;

exports.body = function () {
	header({ class: 'print-header' },
		exports._logo.call(this),
		div({ class: 'print-header-title' },
			h2({ id: 'print-page-title' }),
			p(new db.DateTime())));
	hr();
	section({ id: 'main', class: 'print-body' });
};

exports._logo = Function.prototype;
