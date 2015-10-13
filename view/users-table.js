'use strict';

var _           = require('mano').i18n.bind('Users Admin')
  , db          = require('mano').db

  , User = db.User, roleMeta = db.Role.meta
  , mapRolesToLabels, roleLabels, getUsersTable;

exports._parent = require('./user-base');

getUsersTable = require('./components/users-table');

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
		var user = this.user
		  , users = User.instances.filterByKey('email', function (value, obj) {
			return value && (obj !== user);
		});

		var usersTable = getUsersTable(this.user.usersAdminDataSnapshots, {
			appName: 'users-admin',
			pathname: '/',
			cacheLimits: exports._cacheLimits,
			class: 'submitted-user-data-table',
			users: { '': users },
			compare: function (a, b) {
				return a._lastOwnModified_ - b._lastOwnModified_;
			},
			columns: [
				{
					head: _("Email"),
					data: function (user) {
						return a({ href: '/user/' + user.__id__ + '/' },
							strong(user._fullName), br(), user._email);
					}
				},
				{
					head: _("Role"),
					data: function (user) {
						return a({ href: '/user/' + user.__id__ + '/' },
							ul(user.roles.map(mapRolesToLabels), function (name) {
								return name;
							}));
					}
				},
				{
					head: _("Institution"),
					data: function (user) {
						return a({ href: '/user/' + user.__id__ + '/' }, resolve(user._institution, 'name'));
					}
				},
				{
					head: _("Creation date"),
					data: function (user) {
						return a({ href: '/user/' + user.__id__ + '/' },
							String(new db.DateTime(user.lastModified / 1000)));
					}
				}
			],
			i18n: { all: '' }
		});

		section(a({ href: '/new-user/', class: 'button-main' }, _("New user")));
		insert(usersTable.pagination);
		section({ class: 'table-responsive-container' }, usersTable);
		insert(usersTable.pagination);
	}
};

exports._cacheLimits = {
	listedUsers: 150,
	fullDataUsers: 10,
	usersPerPage: 50,
	pageSnapshots: 20
};
