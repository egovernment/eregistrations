'use strict';

var getColFragments  = require('../data-fragments/get-collection-fragments')
  , getDbSet         = require('./get-db-set')
  , getPartFragments = require('../data-fragments/get-part-object-fragments');
/**
 * Should be used when preparing initial data fragments for users
 * @param {string} keyPath      - path to user property
 * @param {string} value        - serialized
 * @param {array}  userKeyPaths - array of strings,
 *                                where each string represents a property to be retrieved
 * @returns {Fragment} a fragment with promise property
 */
module.exports = function (keyPath, value, userKeyPaths) {
	var userStorage = require('mano').dbDriver.getStorage('user');
	return getDbSet(userStorage, 'direct', keyPath, value)(function (users) {
		return getColFragments(users, getPartFragments(userStorage, userKeyPaths));
	});
};
