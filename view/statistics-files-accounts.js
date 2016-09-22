'use strict';

var aFrom              = require('es5-ext/array/from')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , _                  = require('mano').i18n
  , db                 = require('../db')
  , isOfficialRoleName = require('../utils/is-official-role-name');

exports._parent = require('./statistics-files');

var mapSize = function (val) { return (val == null) ? '-' : val; };

exports['files-nav']    = { class: { 'submitted-menu-item-active': true } };
exports['accounts-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var data = this.statistics.user;
	table({ class: 'statistics-table' },
		thead(tr(
			th(),
			th({ class: 'statistics-table-number' }, _("Total"))
		)),
		tbody(
			tr({ class: 'statistics-table-sub-header statistics-table-sub-header-overall' },
				td(_("Accounts of Part A")),
				td({ class: 'statistics-table-number' }, data.accounts._all.map(mapSize))),

			db.Role.members.has('manager') ? [
				tr(td(_("Normal accounts")),
					td({ class: 'statistics-table-number' }, data.accounts._user.map(mapSize))),
				tr(td(_("Notaries validated")),
					td({ class: 'statistics-table-number' }, data.accounts.manager._active.map(mapSize))),
				tr(td(_("Notaries unvalidated")),
					td({ class: 'statistics-table-number' }, data.accounts.manager._inactive.map(mapSize)))
			] : null,

			tr({ class: 'statistics-table-sub-header statistics-table-sub-header-waiting' },
				td(_("Operators of Part B")),
				td({ class: 'statistics-table-number' }, data.accounts.official._all.map(mapSize))),
			aFrom(db.Role.members, function (roleName) {
				if (!isOfficialRoleName(roleName)) return;
				var shortName = uncapitalize.call(roleName.slice('official'.length));
				return tr(td(db.Role.meta[roleName].label),
					td({ class: 'statistics-table-number' },
						data.accounts.official['_' + shortName].map(mapSize)));
			}),

			tr({ class: 'statistics-table-sub-header statistics-table-sub-header-pending' },
				td(_("Admin accounts")),
				td({ class: 'statistics-table-number' }, data.accounts.admin._all.map(mapSize))),
			tr(td(_("Admin")), td({ class: 'statistics-table-number' },
				data.accounts.admin._usersAdmin.map(mapSize))),
			tr(td(_("Translator")), td({ class: 'statistics-table-number' },
				data.accounts.admin._metaAdmin.map(mapSize))),
			db.Role.members.has('supervisor')
				? tr(td(_("Supervisor")), td({ class: 'statistics-table-number' },
					data.accounts.admin._supervisor.map(mapSize))) : null,
			db.Role.members.has('dispatcher')
				? tr(td(_("Dispatcher")), td({ class: 'statistics-table-number' },
					data.accounts.admin._dispatcher.map(mapSize))) : null,
			tr({ class: 'statistics-table-sub-header statistics-table-sub-header-demo' },
					td(_("Demo accounts")),
					td({ class: 'statistics-table-number' }, data._demo.map(mapSize)))
		));
};
