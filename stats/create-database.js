'use strict';

var Database = require('dbjs')
  , manoAuthUser = require('mano-auth/model/user')
  , statsDb;

module.exports = function (sourceDb) {
	statsDb = new Database();
	statsDb.User = manoAuthUser(statsDb);
	console.log(statsDb);
};
