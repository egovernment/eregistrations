'use strict';

var db         = require('mano').db
  , User       = require('mano-auth/model/user')
  , StringLine = require('dbjs-ext/string/string-line')(db)

  , user = User.prototype;

user.defineProperties({
	firstName: { type: StringLine, required: true, label: "First Name" },
	lastName: { type: StringLine, required: true, label: "Last Name" }
});

module.exports = User;
