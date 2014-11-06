'use strict';

var login = require('./_login'),
		resetPassword = require('./_reset-password-request');

exports.body = function () {
	header({ class: 'header-top-wrapper' },
		div({ class: 'content header-top' },
			div(a({ href: '/' },
					img({ src: '/img/logo-2.png' })
					)
				),
			nav(ul({ class: 'menu-top', id: 'menu' },
					li(a('en')),
					li(a('sw')),
					li(a('link one')),
					li(a('link two')),
					li(a('link tree')),
					li(span({ class: 'login-hint' }, ('Do you have an account?')),
						a({ class: 'login', onclick: login.show },
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
	footer({ class: 'footer-logos' },
		div({ class: 'content' },
			div({ class: 'logos' },
				img({ src: '/img/logo.png' }),
				img({ src: '/img/logo.png' })
				)
			)
		);
};
