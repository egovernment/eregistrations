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
			a(span({ class: 'fa fa-close' }, "Close"))
		),
		section(
			ol(
				li(
					a({ href: '/' }, span("Home page"), span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/multi-entry/' }, span("Home page - multi entry"),
						span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/reset-password/' }, span("Reset password"),
						span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/guide/' }, span("User guide"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/' }, span("User forms"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/disabled/' }, span("User forms - disabled"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/partner-id/' }, span("User forms - parter page"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/partner-add/' }, span("User forms - add new parter"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/documents/' }, span("User documents"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/documents/disabled/' }, span("User documents - disabled"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/submission/' }, span("User submission"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/profile/' }, span("User profile"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/user-submitted/' }, span("User submitted"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/users-admin/' }, span("Users admin"), span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/users-admin/user-id/' }, span("Users admin - user page"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/users-admin/add-user/' }, span("Users admin - add new user"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/users-admin/edit-user-id/' }, span("Users admin - edit user"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/' }, span("Official user"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/revision/user-id/' }, span("User submitted revision"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/user-id/' }, span("Official user - user page"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/user-id/document/' },
							span("Official user - documents page"), span({ class: 'label-reg' }, "Part B"))
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
