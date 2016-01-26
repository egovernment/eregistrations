'use strict';

var _ = require('mano').i18n.bind('View: Supervisor');

//values given in milliseconds

module.exports = [{
	label: _("All"),
	value: 0,
	token: 'all'
}, {
	label: _("30 minutes +"),
	value: 1000 * 60 * 30,
	token: '30min'
}, {
	label: _("1 hour +"),
	value: 1000 * 60 * 60,
	token: '1h'
}, {
	label: _("2 hours +"),
	value: 1000 * 60 * 60 * 2,
	token: '2h'
}, {
	label: _("6 hours +"),
	value: 1000 * 60 * 60 * 6,
	token: '6h'
}, {
	label: _("1 day +"),
	value: 1000 * 60 * 60 * 24,
	token: '1d'
}, {
	label: _("3 days +"),
	value: 1000 * 60 * 60 * 24 * 3,
	token: '3d'
}, {
	label: _("1 week +"),
	value: 1000 * 60 * 60 * 24 * 7,
	token: '1w'
}, {
	label: _("2 weeks +"),
	value: 1000 * 60 * 60 * 24 * 7 * 2,
	token: '2w'
}, {
	label: _("1 month +"),
	value: 1000 * 60 * 60 * 24 * 30,
	token: '1m'
}];
