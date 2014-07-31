'use strict';

var register = require('./_register');

exports.main = function () {
	insert(register);
	div({ 'class': 'sub-public-menu-container nav-burger-container' },
		label({ 'class': 'nav-burger-button', 'for': 'nav-sub-public-control' },
			'Sub public'
			),
		input({ 'id': 'nav-sub-public-control', 'type': 'checkbox', 'role': 'button' }
			),
		nav({ 'class': 'sub-public-menu nav-burger' },
			menuitem(a({ 'id': 'subO' }, 'Index')),
			menuitem(a({ 'id': 'sub1' }, 'Why enable your business?')),
			menuitem(a({ 'id': 'sub2' }, '1. Create your application file')),
			menuitem(a({ 'id': 'sub3' }, '2. Pay the required costs')),
			menuitem(a({ 'id': 'sub4' }, '3. Get your certificates')))
		);
	div({ 'id': 'sup-public-page' });
	footer({ 'class': 'footer-logos' },
		div({ 'class': 'logos' },
			div(
				img({ 'src': '/img/logo.png' })
			),
			div(
				img({ 'src': '/img/logo.png' })
			)
			)
		);
};
