'use strict';

var _     = require('mano').i18n.bind('Users Admin')
  , db    = require('mano').db
  , roleMeta = db.Role.meta
  , mapRolesToLabels, roleLabels;

exports._parent = require('./user-base');

mapRolesToLabels = function (role) {
	if (!role) return 'N/A';
	if (role === 'user') return;
	if (roleMeta[role].label) return roleMeta[role].label;
	return roleLabels[role];
};

roleLabels = {
	'users-admin': 'SITE ADMIN',
	'meta-admin': 'META-ADMIN'
};

exports['submitted-menu'] = { class: { 'submitted-menu-item-active': true } };

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var users = db.User.instances.filterByKey('email');

		section(a({ href: '/new-user/', class: 'button-main' }, _("New user")));
		section({ class: 'table-responsive-container' },
			table({ class: "submitted-user-data-table" },
				thead(
					th(_("Email")),
					th(_("Role")),
					th(_("Institution")),
					th(_("Creation date"))
				),
				tbody(users, function (user) {
					return tr(
						td(a({ href: '/user/' + user.__id__ + '/' },
								strong(user._fullName), br(), user._email)),
						td(a({ href: '/user/' + user.__id__ + '/' },
							ul(user.roles.map(mapRolesToLabels), function (name) {
								return name;
							}))),
						td(a({ href: '/user/' + user.__id__ + '/' }, resolve(user._institution, 'name'))),
						td(a({ href: '/user/' + user.__id__ + '/' },
							String(new db.DateTime(user.lastModified / 1000))))
					);
				})));
	}
};
