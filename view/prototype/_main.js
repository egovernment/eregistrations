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

	dialog(
		{ open: true, class: 'app-nav-dialog' },
		header(
			h4("Application navigation"),
			a("X")
		),
		section(
			ol(
				li(
					a({ href: '/' }, "Public: Home page")
				),
				li(
					a({ href: '/multi-entry/' }, "Public: Home page - multi entry")
				),
				li(
					a({ href: '/reset-password/' }, "Public: Reset password")
				),
				li(
					a({ href: '/guide/' }, "Part A: User guide")
				),
				li(
					a({ href: '/forms/' }, "Part A: User forms")
				),
				li(
					a({ href: '/forms/disabled/' }, "Part A: User forms - disabled")
				),
				li(
					a({ href: '/forms/partner-id/' }, "Part A: User forms - parter page")
				),
				li(
					a({ href: '/partner-add/' }, "Part A: User forms - add new parter")
				),
				li(
					a({ href: '/documents/' }, "Part A: User documents")
				),
				li(
					a({ href: '/documents/disabled/' }, "Part A: User documents - disabled")
				),
				li(
					a({ href: '/submission/' }, "Part A: User submission")
				),
				li(
					a({ href: '/profile/' }, "Part A: User profile")
				),
				li(
					a({ href: '/user-submitted/' }, "Part B: User submitted")
				),
				li(
					a({ href: '/users-admin/' }, "Part B: Users admin")
				),
				li(
					a({ href: '/users-admin/user-id/' }, "Part B: Users admin - user page")
				),
				li(
					a({ href: '/users-admin/add-user/' }, "Part B: Users admin - add new user")
				),
				li(
					a({ href: '/users-admin/edit-user-id/' }, "Part B: Users admin - edit user")
				),
				li(
					a({ href: '/official/' }, "Part B: Official user")
				),
				li(
					a({ href: '/revision/user-id/' }, "Part B:  User submitted revision")
				),
				li(
					a({ href: '/official/user-id/' }, "Part B: Official user - user submitted page")
				),
				li(
					a({ href: '/official/user-id/document/' },
							"Part B: Official user - user submitted documents page")
				)
			)
		),
		footer()
	);

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
