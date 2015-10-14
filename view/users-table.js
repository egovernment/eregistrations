'use strict';

var _     = require('mano').i18n.bind('Users Admin')
  , db    = require('mano').db
  , roleMeta = db.Role.meta
  , mapRolesToLabels;

exports._parent = require('./user-base');

mapRolesToLabels = function (role) {
	if (!role) return 'N/A';
	if (role === 'user') return;
	if (roleMeta[role].label) return roleMeta[role].label;
	return '';
};

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
					th(_("Creation date")),
					th()
				),
				tbody(users, function (user) {
					return tr(
						td(strong(user._fullName), br(), user._email),
						td(
							ul(user.roles.map(mapRolesToLabels), function (name) {
								return name;
							})
						),
						td(resolve(user._institution, 'name')),
						td(String(new db.DateTime(user.lastModified / 1000))),
						td({ class: 'actions' }, a({ href: url('user', user.__id__) },
								span({ class: 'fa fa-edit' },
									_("Go to"))),
							postButton({ buttonClass: 'actions-delete',
								action: url('user', user.__id__, 'delete'),
								confirm: _("Are you sure?"),
								value: span({ class: 'fa fa-trash-o' })
								}))
					);
				})));
	}
};
