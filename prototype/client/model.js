'use strict';

var db       = require('mano').db
  , User     = require('../model/user');
require('../model/user-sections');
require('../model/partner-sections');
require('dbjs-ext/string/string-line/password')(db);
User.prototype.$password.type = db.Password;

module.exports = db;
