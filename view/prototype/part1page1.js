'use strict';

exports.page1 = { class: { active: true } };
exports['sub-page-content'] = function () {
	div({ 'class': 'tabbed-content nav-burger-container' },
		label({ 'class': 'nav-burger-button', 'for': 'nav-tabs-control' },
			'Tabs'
			),
		input({ 'id': 'nav-tabs-control', 'type': 'checkbox', 'role': 'button' }
			),
		menu({ 'class': 'sided-menu nav-burger' },
			menuitem(a({ 'id': 'tab1', 'href': '/part1/page1/tab1' }, 'Presentation')),
			menuitem(a({ 'id': 'tab2', 'href': '/part1/page1/tab2' }, 'Situation and activity')),
			menuitem(a({ 'id': 'tab3' }, 'Resume of application')),
			menuitem(a({ 'id': 'tab4' }, 'Resume of application')),
			menuitem(a({ 'id': 'tab5' }, 'Requirements')),
			menuitem(a({ 'id': 'tab6' }, 'Costs')),
			menuitem(a({ 'id': 'tab7' }, 'Conditions'))
			),
		div({ 'id': 'side-content', 'class': 'sided-content' }));
};
