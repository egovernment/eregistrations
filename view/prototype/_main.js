'use strict';

/*var register = require('./_register')
  , login    = require('./_login');*/

exports.body = function () {
	header({ 'class': 'l-container l-cont-primary s-spacing-third' },
		div({ 'class': 's-resize-center' },
			a({ href: '/' },
				img({ 'src': '/img/logo-lomas.png' })
				)
			),
		nav({ 'class': 's-resize-center' },
			menu({ 'class': 'm-menu-basic' },
				menuitem(a('en')),
				menuitem(a('sw')),
				menuitem({ 'class': 'separation' }),
				menuitem(a('link one')),
				menuitem(a('link two')),
				menuitem(a('link tree')),
				menuitem(button({ 'class': 's-btn-secondary s-btn-small' },
					'Log in'
					))
				)
			)
		/*p(a({ onclick: login.show }, "LOGIN")),
		p(a({ onclick: register.show }, "REGISTER")),
		p(a({ href: '/public-inner/' }, "PUBLIC INNER"))*/
		);

	main({ id: 'main' });

	footer({ 'class': 'l-container l-cont-secondary l-footer' },
		div({ 'class': 'l-container l-cont-primary' },
			div(
				img({ 'src': '/img/logo_unctad.png' })
			),
			div(
				img({ 'src': '/img/logo_lomas_bnw.png' })
			)
			)
		);
};
