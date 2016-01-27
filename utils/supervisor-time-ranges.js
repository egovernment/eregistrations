'use strict';

var _ = require('mano').i18n.bind('View: Supervisor');

//values given in milliseconds

module.exports = [{
	label: _("All"),
	value: 0
}, {
	label: _("30 minutes +"),
	value: 1000 * 60 * 30,
	name: '30M'
}, {
	label: _("1 hour +"),
	value: 1000 * 60 * 60,
	name: '1H'
}, {
	label: _("2 hours +"),
	value: 1000 * 60 * 60 * 2,
	name: '2H'
}, {
	label: _("6 hours +"),
	value: 1000 * 60 * 60 * 6,
	name: '6H'
}, {
	label: _("1 day +"),
	value: 1000 * 60 * 60 * 24,
	name: '1d'
}, {
	label: _("3 days +"),
	value: 1000 * 60 * 60 * 24 * 3,
	name: '3d'
}, {
	label: _("1 week +"),
	value: 1000 * 60 * 60 * 24 * 7,
	name: '1w'
}, {
	label: _("2 weeks +"),
	value: 1000 * 60 * 60 * 24 * 7 * 2,
	name: '2w'
}, {
	label: _("1 month +"),
	value: 1000 * 60 * 60 * 24 * 30,
	name: '1m'
}];
