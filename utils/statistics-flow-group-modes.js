'use strict';

var _ = require('mano').i18n.bind('Routes: Statistics');

module.exports = [
	{ key: 'daily', label: _('Daily'), labelNoun: _("Day") },
	{ key: 'weekly', label: _('Weeky'), labelNoun: _("Week") },
	{ key: 'monthly', label: _('Monthy'), labelNoun: _("Month") },
	{ key: 'yearly', label: _('Yearly'), labelNoun: _("Year") }
];
