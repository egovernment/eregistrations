'use strict';

module.exports = exports = require('../../view/base');

var isReadOnlyRender = require('mano/client/utils/is-read-only-render');

exports.title = "eRegistrations: Prototype demo";

exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });

	if (isReadOnlyRender) {
		// SPA takeover
		script(function (appUrl) {
			var isStrict;
			if (typeof Object.getPrototypeOf !== 'function') return;
			if (typeof Object.defineProperty !== 'function') return;
			if (!window.history) return;
			isStrict = !(function () { return this; }());
			if (!isStrict) return;
			if (Object.getPrototypeOf({ __proto__: Function.prototype }) !== Function.prototype) return;
			if (Object.defineProperty({}, 'foo',  { get: function () { return 'bar'; } }).foo !== 'bar') {
				return;
			}
			if (document.cookie.indexOf('legacy=1') !== -1) return;
			document.write('<scr' + 'ipt defer src="' + appUrl + '"></sc' + 'ript>');
		}, stUrl('prototype.js'));
	}

	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype.css'), rel: 'stylesheet' });
	if (isReadOnlyRender) link({ href: stUrl('prototype-legacy.css'), rel: 'stylesheet' });
};

exports._logo = function () { return img({ src: '/img/logo-2.png' }); };

exports._bodyAppend = function () {
	return dialog(
		{ id: 'dialog-app-nav', open: true, class: 'app-nav-dialog' },
		header(
			h4("Application navigation"),
			a({ onclick: '$(\'dialog-app-nav\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
		),
		section(ol(
			li(
				a({ href: '/' }, span("Login"), span({ class: 'label-reg' }, "Public"))
			),
			li(
				a({ href: '/reset-password/' }, span("Reset password"),
					span({ class: 'label-reg' }, "Public"))
			),
			li(
				a({ href: '/guide/' }, span("User - guide"), span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/guide-lomas/' }, span("User - Lomas like guide "),
						span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/guide/costs-print/' }, span("User - costs print list"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/' }, span("User - forms"), span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/sides/' },
					span("User - tabbed forms - Sides"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/company-informations/' },
					span("User - tabbed forms - Company informations"),
					span({ class: 'label-reg' }, "Part A"))
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
				a({ href: '/nested-entity/example/' }, span("User - forms, add entity"),
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
				a({ href: '/pay/' }, span("User - payment"),
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
				a({ href: '/business-process-submitted/' }, span("User submitted"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/payment-receipts/payment' },
					span("User submitted: Payment receipts"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/certificates/certificate' },
					span("User submitted: Certificates"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/data' }, span("User submitted: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/print-business-processes-data/' }, span("User submitted - data print"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/print-request-history/' }, span("User history print"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/' }, span("My account"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/summary/' }, span("My account: Business process summary"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/documents/' }, span("My account: Business process documents"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/data/' }, span("My account: Business process data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/print/' }, span("My account: Print Business process data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/' }, span("Official"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/' }, span("Official: Revision"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/documents' },
					span("Official: Revision: Requirement"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/certificates/certificate' },
					span("Official: Revision: Certificates"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/payment-receipts' },
					span("Official: Revision: Payment"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/data' }, span("Official: Revision: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/processing' },
					span("Official: Revision: Processing"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/' }, span("Official - Form"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/documents/' },
						span("Official - user documents"), span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/certificates/certificate' },
						span("Official - user certificates"), span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/payment-receipts/payment/' },
						span("Official - user payments"), span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/data/' },
						span("Official - user data"), span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/certificates-process/' },
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
				a({ href: '/users-admin/' }, span("Users admin"), span({ class: 'label-reg' }, "Admin"))
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
				a({ href: '/filtered-statistics/' },
						span("Filtered statistics"), span({ class: 'label-reg' }, "Statistics"))
			),
			li(
				a({ href: '/manager/' },
						span("Notary"), span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager/requests/' },
						span("Notary Requests"), span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager/requests/firstrequest' },
						span("Notary Requests - Guide view"), span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager-validation/edit-user' },
						span("Notary Validation - Edit User"), span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/i18n/' },
						span("Translations"), span({ class: 'label-reg' }, "Meta"))
			)
		)),
		footer()
	);
};

exports._footerContent = function () {
	return div({ class: 'content' },
		div({ class: 'footer-logos-container' },
			img({ src: '/img/logo.png' }),
			img({ src: '/img/logo.png' })
			)
		);
};
