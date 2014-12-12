'use strict';

var login         = require('./_login')
  , register      = require('./_register')
  , resetPassword = require('./_reset-password-request');

exports.main = function () {
	insert(login);
	insert(register);
	insert(resetPassword);
	div({ class: 'public-banner', id: 'banner' },
		div({ class: 'public-banner-text content' },
				div({ class: 'public-banner-box-text' },
					h1("Turn your online business on"),
					h3("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in " +
						"massa malesuada, pharetra urna nec, pellentesque tortor. "),
					a({ class: 'create-account', href: '#register' },
						'Create account')
				),
				div({ class: 'public-baner-box-img' },
					img({ src: '/img/mac.png' })
				)
				)
		);
	div(
		{ class: 'content' },
		ul({ class: 'public-steps' },
			li({ class: 'public-steps-clickable' },
				a(
					img({ src: '/img/img-300.png' }),
					h3('Create your file'),
					p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
						" nequepharetra, pellentesque risus in, condimentum nulla.")
				)
				),
			li(
				img({ src: '/img/img-300.png' }),
				h3('Pay costs'),
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
					" nequepharetra, pellentesque risus in, condimentum nulla. "),
				p(a({ class: 'step-button', href: '/guide/' },
					'More info'))
			),
			li(
				img({ src: '/img/img-300.png' }),
				h3('Remove certificates'),
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
					" nequepharetra, pellentesque risus in, condimentum nulla. "),
				p(a({ class: 'step-button ', href: '/guide/' },
					'More info'))
			)
			),
		ul({ class: 'public-institutions' },
			li(a(img({ src: '/img/img-150.png' }))),
			li(a(img({ src: '/img/img-150.png' })))
			)
	);
};
