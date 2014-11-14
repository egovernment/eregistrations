'use strict';

var login = require('./_login'),
		resetPassword = require('./_reset-password-request');

exports.body = function () {
	var closeBtn, openBtn, appNavDialog, close, open;

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
					li(openBtn = a('nav dialog')),
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

	appNavDialog = dialog(
		{ open: true, class: 'app-nav-dialog' },
		header(
			h4("Application navigation"),
			closeBtn = a(span({ class: 'fa fa-close' }, "Close"))
		),
		section(
			ol(
				li(
					a({ href: '/' }, span("Public"), span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/multi-entry/' }, span("Public - multi entry"),
						span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/reset-password/' }, span("Reset password"),
						span({ class: 'label-reg' }, "Public"))
				),
				li(
					a({ href: '/guide/' }, span("User - guide"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/' }, span("User - forms"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/disabled/' }, span("User - forms (disabled)"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/forms/partner-id/' }, span("User - forms, partner"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/partner-add/' }, span("User - forms, add partner"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/documents/' }, span("User - documents"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/documents/disabled/' }, span("User - documents (disabled)"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/submission/' }, span("User - submission"),
						span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/profile/' }, span("User - profile"), span({ class: 'label-reg' }, "Part A"))
				),
				li(
					a({ href: '/user-submitted/' }, span("User submitted"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/users-admin/' }, span("Users admin"), span({ class: 'label-reg' }, "Admin"))
				),
				li(
					a({ href: '/users-admin/user-id/' }, span("Users admin - user"),
						span({ class: 'label-reg' }, "Admin"))
				),
				li(
					a({ href: '/users-admin/add-user/' }, span("Users admin - add user"),
						span({ class: 'label-reg' }, "Admin"))
				),
				li(
					a({ href: '/users-admin/edit-user-id/' }, span("Users admin - edit user"),
						span({ class: 'label-reg' }, "Admin"))
				),
				li(
					a({ href: '/official/' }, span("Official"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/revision/user-id/' }, span("Official - user at revision"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/user-id/' }, span("Official - user"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/user-id/document/' },
							span("Official - user, document"), span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/official/user-id/certificates/' },
							span("Official - user at certificate process"),
							span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/front-desk/user-id/' },
							span("Official - user at front-desk"), span({ class: 'label-reg' }, "Part B"))
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

	close = function () {
		if (typeof appNavDialog.close === 'function') {
			appNavDialog.close();
			return;
		}
		appNavDialog.exclude();
	};

	open = function () {
		if (typeof appNavDialog.show === 'function') {
			appNavDialog.show();
			return;
		}
		appNavDialog.include();
	};

	closeBtn.onclick = close;
	openBtn.onclick = open;
};
