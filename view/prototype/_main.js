'use strict';

/*var register = require('./_register')
  , login    = require('./_login');*/

exports.body = function () {
	header({ 'class': 'l-container l-primary' },
		div(
			a({ href: '/' },
				img({ 'src': 'img/logo-lomas.png' })
				)
		),
		nav({ 'class': '' },
			ul({ 'class': 'm-menu-basic' },
				li(a('en')),
				li(a('sw')),
				li({ 'class': 'separation' }),
				li(a('link one')),
				li(a('link two')),
				li(a('link tree'))
				)
			)
		/*p(a({ onclick: login.show }, "LOGIN")),
		p(a({ onclick: register.show }, "REGISTER")),
		p(a({ href: '/public-inner/' }, "PUBLIC INNER"))*/
		);

	div({ id: 'main' });

	footer({ 'class': 'l-container l-secondary l-footer' },
		div({ 'class': 'l-container l-primary' },
			div(
				img({ 'src': 'img/logo_unctad.png' })
			),
			div(
				img({ 'src': 'img/logo_lomas_bnw.png' })
			)
			)
		);
};
