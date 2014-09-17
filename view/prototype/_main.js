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
			nav(menu({ class: 'menu-top', id: 'menu' })
				)
			)
		);
	div({ class: 'modal-courtain' });
	insert(login);
	insert(resetPassword);
	main({ id: 'main' });
};
