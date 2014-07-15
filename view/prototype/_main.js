'use strict';

/*var register = require('./_register')
  , login    = require('./_login');*/

exports.body = function () {
	header({ 'class': 'header-top' },
		div(a({ href: '/' },
				img({ 'src': '/img/logo-2.png' })
				)
			),
		nav(menu({ 'class': 'menu-top' },
				menuitem(a('en')),
				menuitem(a('sw')),
				menuitem(a('link one')),
				menuitem(a('link two')),
				menuitem(a('link tree')),
				menuitem(a({ 'class': 'login' },
					'Log in'
					))
				)
			)
		/*p(a({ onclick: login.show }, "LOGIN")),
		p(a({ onclick: register.show }, "REGISTER")),
		p(a({ href: '/public-inner/' }, "PUBLIC INNER"))*/
		);

	main({ id: 'main' });
};
