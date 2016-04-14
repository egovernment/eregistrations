'use strict';

var getColFragments  = require('../data-fragments/get-collection-fragments')
  , getDbSet         = require('./get-db-set')
  , getPartFragments = require('../data-fragments/get-part-object-fragments');

module.exports = function (keyPath, value, resulKeyPaths) {
	var userStorage = require('mano').dbDriver.getStorage('user');
	return getDbSet(userStorage, 'direct', keyPath, value)(function (users) {
		return getColFragments(users, getPartFragments(userStorage, resulKeyPaths));
	});
};
