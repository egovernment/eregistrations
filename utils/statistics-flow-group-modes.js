'use strict';

var _ = require('mano').i18n.bind('Routes: Statistics');

module.exports = [
	{ key: 'daily', label: _('Daily'), labelNoun: _("Day"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 10);
	} },
	{ key: 'weekly', label: _('Weeky'), labelNoun: _("Week"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 10);
	} },
	{ key: 'monthly', label: _('Monthy'), labelNoun: _("Month"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 7);
	} },
	{ key: 'yearly', label: _('Yearly'), labelNoun: _("Year"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 4);
	} }
];
