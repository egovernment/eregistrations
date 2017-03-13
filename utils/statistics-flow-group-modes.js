'use strict';

var _   = require('mano').i18n.bind('Routes: Statistics')
  , Map = require('es6-map');

module.exports = new Map([
	['daily', { label: _('Daily'), labelNoun: _("Day"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 10);
	} }],
	['weekly', { label: _('Weekly'), labelNoun: _("Week"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 10);
	} }],
	['monthly', { label: _('Monthly'), labelNoun: _("Month"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 7);
	} }],
	['yearly', { label: _('Yearly'), labelNoun: _("Year"), getDisplayedKey: function (date) {
		return date.toISOString().slice(0, 4);
	} }]
]);
