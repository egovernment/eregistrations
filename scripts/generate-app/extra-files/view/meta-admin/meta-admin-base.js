'use strict';

var _ = require('../../i18n').bind('View: Meta Admin');

module.exports = exports = require('eregistrations/view/meta-admin-base');

exports._metaAdminNav = function () {
	return [
		li({ id: "translations-nav" }, a({ href: '/', class: 'pills-nav-pill' }, _("Translations")))
	];
};
