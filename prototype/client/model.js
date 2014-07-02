'use strict';

var db       = require('mano').db
  , User     = require('../model/user');

require('dbjs-ext/string/string-line/password')(db);
User.prototype.$password.type = db.Password;

module.exports = db;
