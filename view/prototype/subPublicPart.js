'use strict';

exports.sub1 = { class: { active: true } };
exports['sup-public-page'] = function () {
	div({ class: 'sub-public-sub-menu-container nav-mobile-container' },
		label({ class: 'nav-mobile-button', for: 'show-pages-control' },
			'Pages'
			),
		input({ id: 'show-pages-control', type: 'checkbox', role: 'button' }
			),
		nav({ class: 'sub-public-sub-menu nav-mobile' },
			menuitem(a({ id: 'page1' },
				span({ class: 'fa fa-laptop' }),
				'Interactive guide')),
			menuitem({ class: 'sub-public-sub-menu-separator' }),
			menuitem(a({ id: 'page2' },
				span({ class: 'fa fa-clipboard' }),
				'Fill the forms')),
			menuitem({ class: 'sub-public-sub-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-download' }),
				'Upload documents')),
			menuitem({ class: 'sub-public-sub-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-envelope' }),
				'Send the file')))
		);
	div({ id: 'sub-page-content', class: 'sub-public-main' });
};
