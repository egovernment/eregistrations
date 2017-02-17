'use strict';

var _            = require('mano').i18n.bind('View: Select User')
  , db           = require('../../../db')
  , location     = require('mano/lib/client/location');

module.exports = function (/* opts */) {
	var opts, name, label, id, userQuery, usersCollection;
	opts         = Object(arguments[0]);
	name         = opts.name || 'user';
	label        = opts.label || _("All");
	id           = opts.id || 'user-select';
	usersCollection = opts.usersCollection || db.User.instances;
	userQuery = location.query.get(name);
	return select(
		{ id: id, name: name },
		option({ value: '', selected: userQuery.map(function (value) {
			return value ? null : 'selected';
		}) }, label),
		list(usersCollection, function (user) {
			return option({
				value: user.__id__,
				selected: userQuery.map(function (value) {
					var selected = (user.__id__ ? (value === user.__id__) : (value == null));
					return selected ? 'selected' : null;
				})
			}, user.fullName);
		})
	);
};
