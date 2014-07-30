'use strict';

exports.sub1 = { class: { active: true } };
exports['sup-public-page'] = function () {
	div({ 'class': 'sub-public-sub-menu-container' },
		menu({ 'class': 'sub-public-sub-menu' },
			menuitem(a({ 'id': 'page1' },
				img({ 'src': '/img/logo.png' }),
				'Interactive guide')),
			menuitem({ 'class': 'separator' }),
			menuitem(a({ 'id': 'page2' },
				img({ 'src': '/img/logo.png' }),
				'Fill the forms')),
			menuitem({ 'class': 'separator' }),
			menuitem(a({ 'id': 'page3' },
				img({ 'src': '/img/logo.png' }),
				'Upload documents')),
			menuitem({ 'class': 'separator' }),
			menuitem(a({ 'id': 'page3' },
				img({ 'src': '/img/logo.png' }),
				'Send the file')))
		);
	div({ 'id': 'sub-page-content', 'class': 'sub-public-main' });
};
