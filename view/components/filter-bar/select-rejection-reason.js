'use strict';

var _        = require('mano').i18n.bind('View: Select Service')
  , db       = require('../../../db')
  , location = require('mano/lib/client/location');

module.exports = function (/* opts */) {
	var opts, name, label, id, serviceQuery;
	opts         = Object(arguments[0]);
	name         = opts.name || 'rejectionReasonType';
	label        = opts.label || _("All");
	id           = opts.id || 'rejection-reason-type-select';
	serviceQuery = location.query.get(name);
	return select(
		{ id: id, name: name },
		option({ value: '', selected: serviceQuery.map(function (value) {
			return value ? null : 'selected';
		}) }, label),
		list(['rejected', 'sentBack'], function (reasonType) {
			return option({
				value: reasonType,
				selected: serviceQuery.map(function (value) {
					var selected = (reasonType ? (value === reasonType) : (value == null));
					return selected ? 'selected' : null;
				})
			}, db.ProcessingStepStatus.meta[reasonType].label);
		})
	);
};
