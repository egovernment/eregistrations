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
	div({ class: 'public-banner', id: 'banner' },
		div({ class: 'banner-infos content' },
				div({ class: 'baner-box-text' },
					h1({ class: 's-primary' },
						'Turn your online business on'),
					h3({ class: 's-primary' },
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in ' +
						'massa malesuada, pharetra urna nec, pellentesque tortor. '),
					a({ class: 'create-account', onclick: register.show },
						'Create account')
				),
				div({ class: 'baner-box-img' },
					img({ src: '/img/mac.png' })
				)
				)
		);
	div(
		{ class: 'content' },
		div({ class: 'public-steps' },
			div({ class: 'm-box-text-centered' },
				img({ src: '/img/img-300.png' }),
				h3('Create your file'),
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
					" nequepharetra, pellentesque risus in, condimentum nulla. "),
				a({ class: 'more-info', href: '/guide/' },
					'More info'
					)
				),
			div({ class: 'm-box-text-centered' },
				img({ src: '/img/img-300.png' }),
				h3('Pay costs'),
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
					" nequepharetra, pellentesque risus in, condimentum nulla. "),
				a({ class: 'more-info', href: '/guide/' },
					'More info'
					)
				),
			div({ class: 'm-box-text-centered' },
				img({ src: '/img/img-300.png' }),
				h3('Remove certificates'),
				p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
					" nequepharetra, pellentesque risus in, condimentum nulla. "),
				a({ class: 'more-info', href: '/guide/' },
					'More info'
					))
			),
		ul({ class: 'public-institutions' },
			li(a(img({ src: '/img/img-150.png' }))),
			li(a(img({ src: '/img/img-150.png' })))
			)
	);

	footer({ class: 'footer-logos' },
		div({ class: 'content' },
			div({ class: 'logos' },
				img({ src: '/img/logo.png' }),
				img({ src: '/img/logo.png' })
				)
			)
		);
};
