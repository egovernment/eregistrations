'use strict';

var login = require('./_login'),
		resetPassword = require('./_reset-password-request');

exports.body = function () {
	header({ class: 'header-top-full-page-wrapper' },
		div({ class: 'header-top' },
			div(a({ href: '/' },
					img({ src: '/img/logo-2.png' })
					)
				),
			nav(menu({ class: 'menu-top', id: 'menu' },
					menuitem(a('en')),
					menuitem(a('sw')),
					menuitem(a('link one')),
					menuitem(a('link two')),
					menuitem(a('link tree')),
					menuitem(a({ class: 'login', onclick: login.show },
						"Log in"
						))
					)
				)
			)
		);
	div({ class: 'modal-courtain' });
	insert(login);
	insert(resetPassword);
	main({ id: 'main' });
};
