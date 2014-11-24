'use strict';

exports['user-name'] = function () {
	text("Translations");
};

exports['submitted-menu'] = function () {
	nav(
		ul(
			{ class: 'items' },
			li(
				a({ class: 'item-active', href: '/i18n/' },
					"Application")
			),
			li(
				a({ href: '/profile/' }, "Profile")
			)
		)
	);
};

exports['sub-main'] = function () {
	p('Translations');
};
