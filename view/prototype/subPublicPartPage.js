'use strict';

exports.page1 = { class: { active: true } };
exports['sub-page-content'] = function () {
	div({ class: 'tabbed-content nav-mobile-container' },
		label({ class: 'nav-mobile-button', for: 'nav-tabs-control' },
			'Tabs'
			),
		input({ id: 'nav-tabs-control', type: 'checkbox', role: 'button' }
			),
		menu({ class: 'sided-menu nav-mobile' },
			menuitem(a({ id: 'tab1', href: '/subpublic/interactive-guide/presentation' },
				'Presentation')),
			menuitem(a({ id: 'tab2', href: '/subpublic/interactive-guide/situation' },
				'Situation and activity')),
			menuitem(a({ id: 'tab3' }, 'Resume of application')),
			menuitem(a({ id: 'tab4' }, 'Resume of application')),
			menuitem(a({ id: 'tab5' }, 'Requirements')),
			menuitem(a({ id: 'tab6' }, 'Costs')),
			menuitem(a({ id: 'tab7' }, 'Conditions'))
			),
		div({ id: 'side-content', class: 'sided-content' }));
};
