'use strict';

var Database = require('dbjs')
  , defineUser = require('../../../model/user/base');

module.exports = function (t, a) {
	var db = new Database()
	  , User = t(defineUser(db))

	  , user = new User();

	a(user.getDescriptor('institution').type, db.Institution);
};
