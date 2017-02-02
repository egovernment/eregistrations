'use strict';

var _            = require('mano').i18n.bind('View: Select Service')
  , db           = require('../../db')
  , location     = require('mano/lib/client/location')
  , uncapitalize = require('es5-ext/string/#/uncapitalize');

module.exports = function (/* opts */) {
	var opts, name, label, id, serviceQuery;
	opts         = Object(arguments[0]);
	name         = opts.name || 'service';
	label        = opts.label || _("All");
	id           = opts.id || 'service-select';
	serviceQuery = location.query.get(name);
	return select(
		{ id: id, name: name },
		option({ value: '', selected: serviceQuery.map(function (value) {
			return value ? null : 'selected';
		}) }, label),
		list(db.BusinessProcess.extensions, function (ServiceType) {
			var serviceName = uncapitalize.call(
				ServiceType.__id__.slice('BusinessProcess'.length)
			);

			return option({
				value: serviceName,
				selected: serviceQuery.map(function (value) {
					var selected = (serviceName ? (value === serviceName) : (value == null));
					return selected ? 'selected' : null;
				})
			}, ServiceType.prototype.label);
		})
	);
};
