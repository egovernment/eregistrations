'use strict';

var login = require('./_login');

exports.body = function () {
	header({ class: 'header-top' },
		div(a({ href: '/' },
				img({ src: '/img/logo-2.png' })
				)
			),
		nav(menu({ class: 'menu-top' },
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
		);
	div({ class: 'modal-courtain' });
	insert(login);
	main({ id: 'main' });
};
