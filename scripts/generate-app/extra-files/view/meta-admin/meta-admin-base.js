'use strict';

var _ = require('../../i18n').bind('View: Meta Admin');

module.exports = exports = require('eregistrations/view/meta-admin-base');

exports['submitted-menu'] = function () {
	li({ id: 'translations-nav' }, a({ href: '/' }, _("Translations")));
};
