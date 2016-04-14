'use strict';

var getColFragments  = require('eregistrations/server/data-fragments/get-collection-fragments')
  , getDbSet         = require('eregistrations/server/utils/get-db-set')
  , getPartFragments = require('eregistrations/server/data-fragments/get-part-object-fragments');

module.exports = function (keyPath, value, resulKeyPaths) {
	var userStorage = require('mano').dbDriver.getStorage('user');
	return getDbSet(userStorage, 'direct', keyPath, value)(function (users) {
		return getColFragments(users, getPartFragments(userStorage, resulKeyPaths));
	});
};
