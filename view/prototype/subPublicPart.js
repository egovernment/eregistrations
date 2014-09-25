'use strict';

exports.sub1 = { class: { active: true } };
exports['public-sub-page'] = function () {
	div({ class: 'public-parts-menu-container nav-mobile-container' },
		label({ class: 'nav-mobile-button', for: 'show-pages-control' },
			'Pages'
			),
		input({ id: 'show-pages-control', type: 'checkbox', role: 'button' }
			),
		nav({ class: 'public-parts-menu content nav-mobile' },
			menuitem(a({ id: 'page1' },
				span({ class: 'fa fa-laptop' }),
				'Interactive guide')),
			menuitem({ class: 'public-parts-menu-separator' }),
			menuitem(a({ id: 'page2' },
				span({ class: 'fa fa-clipboard' }),
				'Fill the forms')),
			menuitem({ class: 'public-parts-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-download' }),
				'Upload documents')),
			menuitem({ class: 'public-parts-menu-separator' }),
			menuitem(a({ id: 'page3' },
				span({ class: 'fa fa-envelope' }),
				'Send the file')))
		);
	div({ id: 'sub-page-content', class: 'public-sub-main' });
};
