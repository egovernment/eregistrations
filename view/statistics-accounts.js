'use strict';

var aFrom              = require('es5-ext/array/from')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , _                  = require('mano').i18n
  , db                 = require('../db')
  , isOfficialRoleName = require('../utils/is-official-role-name');

exports._parent = require('./statistics-base');

var mapSize = function (val) { return (val == null) ? '-' : val; };

exports['accounts-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var data = this.statistics.user;
	table({ class: 'statistics-table' },
		thead(tr(
			th(),
			th(_("Total"))
		)),
		tbody(
			tr({ class: 'statistics-table-sub-header' }, td(_("Accounts of Part A")),
				td(data.accounts._all.map(mapSize))),

			db.Role.members.has('manager') ? [
				tr(td(_("Normal accounts")), td(data.accounts._user.map(mapSize))),
				tr(td(_("Notaries validated")), td(data.accounts.manager._active.map(mapSize))),
				tr(td(_("Notaries unvalidated")), td(data.accounts.manager._inactive.map(mapSize)))
			] : null,

			tr({ class: 'statistics-table-sub-header' }, td(_("Operators of Part B")),
				td(data.accounts.official._all.map(mapSize))),
			aFrom(db.Role.members, function (roleName) {
				if (!isOfficialRoleName(roleName)) return;
				var shortName = uncapitalize.call(roleName.slice('official'.length));
				return tr(td(db.Role.meta[roleName].label),
					td(data.accounts.official['_' + shortName].map(mapSize)));
			}),

			tr({ class: 'statistics-table-sub-header' }, td(_("Admin accounts")),
				td(data.accounts.admin._all.map(mapSize))),
			tr(td(_("Admin")), td(data.accounts.admin._usersAdmin.map(mapSize))),
			tr(td(_("Translator")), td(data.accounts.admin._metaAdmin.map(mapSize))),
			db.Role.members.has('supervisor')
				? tr(td(_("Supervisor")), td(data.accounts.admin._supervisor.map(mapSize))) : null,
			db.Role.members.has('dispatcher')
				? tr(td(_("Dispatcher")), td(data.accounts.admin._dispatcher.map(mapSize))) : null,
			tr({ class: 'statistics-table-sub-header' }, td(_("Demo accounts")),
					td(data._demo.map(mapSize)))
		));
};
