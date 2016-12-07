// Should not be run inside any other major application process

'use strict';

var db         = require('../db')
  , env        = require('mano').env
  , initDriver = require('../server/utils/init-driver')
  , resolve    = require('path').resolve
  , debug      = require('debug-ext')('setup')
  , setupSuperUserRoles = require('../utils/setup-super-user-roles')

  , root       = resolve(__dirname, '../../../');

//Below script assumes that model/user/roles of the end system has been setup

module.exports = function () {
	var driver   = initDriver(root, ['user'], env.db, { database: db })
	  , storage  = driver.getStorage('user');

	debug('setup-super-user-roles');

	return storage.search({
		keyPath: 'isSuperUser',
		value: '11'
	}, function (id, data) {
		var userId = id.split('/', 1)[0];
		return storage.loadObject(userId);
	})(function () {
		db.User.instances.forEach(function (superUser) {
			setupSuperUserRoles(superUser);
		});
		return driver.close();
	});
};
