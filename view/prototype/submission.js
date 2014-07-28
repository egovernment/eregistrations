'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {

	section(
		{ 'class': 'section-primary' },
		h2("Section A"),
		div("test")
	);

	section(
		{ 'class': 'section-primary' },
		h2("Section A"),
		div("test")
	);

	section(
		{ 'class': 'section-primary' },
		h2("Section A"),
		div("test")
	);

	div(
		{ 'class': 'nav-back' },
		a({ 'href': '/forms' }, "Submit")
	);
};
