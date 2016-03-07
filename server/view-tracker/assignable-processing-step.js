'use strict';

var findKey        = require('es5-ext/object/find-key')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , capitalize     = require('es5-ext/string/#/capitalize')
  , deferred       = require('deferred')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , ensureStorage  = require('dbjs-persistence/ensure-storage')
  , getDbSet       = require('../utils/get-db-set')
  , trackStep      = require('./processing-step')
  , trackStatus    = require('./processing-step-status');

module.exports = function (stepPath, meta, data) {
	var userStorage, roleName, defaultStatus;
	stepPath = ensureString(stepPath);
	meta = ensureObject(meta);
	data = ensureObject(data);
	userStorage = ensureStorage(data.userStorage);
	defaultStatus = findKey(meta, function (conf) { return conf.default; });
	if (!defaultStatus) throw new Error("Could not resolve default status");

	var getFragment = function (officialId) {
		trackStep(stepPath, meta, {
			businessProcessStorage: data.businessProcessStorage,
			reducedStorage: data.reducedStorage,
			officialId: officialId,
			itemsPerPage: data.itemsPerPage
		}).done();
	};

	if (data.shortRoleName != null) roleName = 'official' + capitalize.call(data.shortRoleName);
	else roleName = 'official' + capitalize.call(stepPath);

	return deferred(
		trackStatus(stepPath, defaultStatus, {
			meta: meta[defaultStatus],
			businessProcessStorage: data.businessProcessStorage,
			reducedStorage: data.reducedStorage,
			officialId: data.officialId,
			itemsPerPage: data.itemsPerPage
		}),
		getDbSet(userStorage, 'direct', 'roles', serializeValue(roleName))(function (officials) {
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
		})
	);
};
