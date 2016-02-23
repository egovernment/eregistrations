'use strict';

var ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , capitalize     = require('es5-ext/string/#/capitalize')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , ensureStorage  = require('dbjs-persistence/ensure-storage')
  , getDbSet       = require('../utils/get-db-set')
  , trackStep      = require('./processing-step');

module.exports = function (stepPath, meta, data) {
	var userStorage, roleName;
	stepPath = ensureString(stepPath);
	meta = ensureObject(meta);
	data = ensureObject(data);
	userStorage = ensureStorage(data.userStorage);

	if (data.shortRoleName != null) roleName = 'official' + capitalize.call(data.shortRoleName);
	else roleName = 'official' + capitalize.call(stepPath);

	var getFragment = function (officialId) {
		trackStep(stepPath, meta, {
			businessProcessStorage: data.businessProcessStorage,
			reducedStorage: data.reducedStorage,
			officialId: officialId,
			itemsPerPage: data.itemsPerPage
		}).done();
	};
	return getDbSet(userStorage, 'direct', 'roles', serializeValue(roleName))(function (officials) {
		officials.on('change', function (ev) {
			if (ev.type === 'delete') return;
			if (ev.type === 'add') {
				getFragment(ev.value);
				return;
			}
			if (ev.type === 'batch') {
				if (!ev.added) return;
				ev.added.forEach(getFragment);
				return;
			}

			throw new Error("Unsupported event: " + ev.type);
		});
		officials.forEach(getFragment);
	});
};
