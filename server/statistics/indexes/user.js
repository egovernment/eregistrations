'use strict';

var ensureObject       = require('es5-ext/object/valid-object')
  , uncapitalize       = require('es5-ext/string/#/uncapitalize')
  , Set                = require('es6-set')
  , ensureDatabase     = require('dbjs/valid-dbjs')
  , ensureStorage      = require('dbjs-persistence/ensure-storage')
  , isOfficialRoleName = require('../../../utils/is-official-role-name');

var adminAccounts = new Set(['dispatcher', 'metaAdmin', 'supervisor', 'usersAdmin']);

module.exports = function (db, data) {
	ensureDatabase(db);
	ensureObject(data);

	var storage = ensureStorage(data.storage)
	  , ns = 'statistics/user/'
	  , accounts = db.User.filterByKey('email').filterByKey('password')
	  , currentNs = ns + 'accounts/';

	storage.trackCollectionSize(currentNs + 'all', accounts);

	storage.trackCollectionSize(currentNs + 'user', accounts.filterByKey('roles',
		function (roles) { return roles.has('user'); }));

	// Managers active & inactive
	if (db.Role.members.has('manager')) {
		var managers = accounts.filterByKey('roles', function (roles) { return roles.has('manager'); });
		storage.trackCollectionSize(currentNs + 'manager/active',
			managers.filterByKey('isManagerActive', true));
		storage.trackCollectionSize(currentNs + 'manager/inactive',
			managers.filterByKey('isManagerActive', false));
	}

	// Official roles
	storage.trackCollectionSize(currentNs + 'official/all',
		accounts.filterByKey('roles', function (roles) { return roles.some(isOfficialRoleName); }));
	db.Role.members.forEach(function (roleName) {
		if (!isOfficialRoleName(roleName)) return;
		var shortName = uncapitalize.call(roleName.slice('official'.length));
		storage.trackCollectionSize(currentNs + 'official/' + shortName,
			accounts.filterByKey('roles', function (roles) { return roles.has(roleName); }));
	});

	// Admins (users, meta, supervisor, dispatcher)
	storage.trackCollectionSize(currentNs + 'admin/all',
		accounts.filterByKey('roles', function (roles) {
			return roles.some(adminAccounts.has.bind(adminAccounts));
		}));
	storage.trackCollectionSize(currentNs + 'admin/usersAdmin',
		accounts.filterByKey('roles', function (roles) { return roles.has('usersAdmin'); }));
	storage.trackCollectionSize(currentNs + 'admin/metaAdmin',
		accounts.filterByKey('roles', function (roles) { return roles.has('metaAdmin'); }));

	if (db.Role.members.has('dispatcher')) {
		storage.trackCollectionSize(currentNs + 'admin/dispatcher',
			accounts.filterByKey('roles', function (roles) { return roles.has('dispatcher'); }));
	}
	if (db.Role.members.has('supervisor')) {
		storage.trackCollectionSize(currentNs + 'admin/supervisor',
			accounts.filterByKey('roles', function (roles) { return roles.has('supervisor'); }));
	}

	// Demo accounts
	storage.trackCollectionSize(ns + 'demo', db.User.filterByKey('isDemo', true));
};
