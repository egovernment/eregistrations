'use strict';

var noop           = require('es5-ext/function/noop')
  , modalContainer = require('./_modal-container');

exports.body = function () {
	var modalCurtain;

	header({ class: 'header-top' },
		div({ class: 'content header-top-wrapper' },
			div({ class: 'header-top-logo' }, a({ href: '/' },
					img({ src: '/img/logo-2.png' })
					)
				),
			nav(ul({ class: 'header-top-menu', id: 'menu' },
				li(a('en')),
				li(a('sw')),
				li(a('link one')),
				li(a('link two')),
				li(a({ onclick: '$(\'dialog-app-nav\').include()' }, 'nav dialog')),
				li(span({ class: 'header-top-login-hint' }, ('Do you have an account?')),
					a({ class: 'header-top-login', href: '#login' },
						"Log in"))
					)
				)
			)
		);
	modalCurtain = div({ class: 'modal-courtain' });

	dialog(
		{ id: 'dialog-app-nav', open: true, class: 'app-nav-dialog' },
		header(
			h4("Application navigation"),
			a({ onclick: '$(\'dialog-app-nav\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
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
					a({ href: '/guide/costs-print/' }, span("User - costs print list"),
						span({ class: 'label-reg' }, "Part A"))
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
					a({ href: '/user-submitted/data-print/' }, span("User submitted - data print"),
						span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/user-submitted/history-print/' }, span("User history print"),
						span({ class: 'label-reg' }, "Part B"))
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
				),
				li(
					a({ href: '/official/users-list/print/' },
							span("Official - users print list"), span({ class: 'label-reg' }, "Part B"))
				),
				li(
					a({ href: '/demo-user/' }, span("Demo user"),
						span({ class: 'label-reg' }, "Demo"))
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
					a({ href: '/statistics/' },
							span("Statistics"), span({ class: 'label-reg' }, "Statistics"))
				),
				li(
					a({ href: '/i18n/' },
							span("Translations"), span({ class: 'label-reg' }, "Meta"))
				)
			)
		),
		footer()
	);

	main({ id: 'main' });
	footer({ class: 'footer-logos' },
		div({ class: 'content' },
			div({ class: 'footer-logos-container' },
				img({ src: '/img/logo.png' }),
				img({ src: '/img/logo.png' })
				)
			)
		);
	insert(modalContainer);

	// iOS fix, without that modals don't get closed
	modalCurtain.addEventListener('click', noop, false);
};
