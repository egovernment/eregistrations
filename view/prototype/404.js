'use strict';

var register = require('./_register'),
	login = require('./_login');

exports.menu = function () {
	menuitem(a('en'));
	menuitem(a('sw'));
	menuitem(a('link one'));
	menuitem(a('link two'));
	menuitem(a('link tree'));
	menuitem(a({ class: 'login', onclick: login.show },
		"Log in"
		));
};

exports.main = function () {
	insert(register);
	div({ class: 'public-error content' },
		div(
			h1("Oops!"),
			h1({ class: 'error-type' }, "#404"),
			h2("We are very sorry, but it seems that page that You are looking for doesn't exist.")
		)
		);
};
