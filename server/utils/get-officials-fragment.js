// Returns fragment with data of all official roles

'use strict';

var aFrom            = require('es5-ext/array/from')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , deferred         = require('deferred')
  , FragmentGroup    = require('data-fragment/group')
  , ensureDatabase   = require('dbjs/valid-dbjs')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , ensureStorage    = require('dbjs-persistence/ensure-storage')
  , getUsersFragment = require('./get-users-fragment')
  , isOfficialRole   = require('../../utils/is-official-role-name');

module.exports = function (db, storage/*, options*/) {
	var roleNames = aFrom(ensureDatabase(db).Role.members).filter(isOfficialRole)
	  , keyPaths, options = Object(arguments[2]);
	ensureStorage(storage);
	if (options.keyPaths != null) keyPaths = aFrom(ensureIterable(options.keyPaths));
	else keyPaths = ['email', 'firstName', 'lastName'];
	var fragment = new FragmentGroup();
	fragment.promise = deferred.map(roleNames, function (roleName) {
		return getUsersFragment('roles', serializeValue(roleName), keyPaths)(function (roleFragment) {
			fragment.addFragment(roleFragment);
		});
	});
	return fragment;
};
