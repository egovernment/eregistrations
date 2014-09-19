'use strict';

exports.sub1 = { class: { active: true } };
exports['public-sub-page'] = function () {
	div({ class: 'public-sub-sub-menu-container nav-mobile-container' },
		label({ class: 'nav-mobile-button', for: 'show-pages-control' },
			'Pages'
			),
		input({ id: 'show-pages-control', type: 'checkbox', role: 'button' }
			),
		nav({ class: 'public-sub-sub-menu nav-mobile' },
			menuitem(a({ id: 'page1' },
				span({ class: 'fa fa-laptop' }),
				'Interactive guide')),
			menuitem({ class: 'public-sub-sub-menu-separator' }),
			menuitem(a({ id: 'page2' },
				span({ class: 'fa fa-clipboard' }),
				'Fill the forms')),
			menuitem({ class: 'public-sub-sub-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-download' }),
				'Upload documents')),
			menuitem({ class: 'public-sub-sub-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-envelope' }),
				'Send the file')))
		);
	div({ id: 'sub-page-content', class: 'public-sub-main' });
};
