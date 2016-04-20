'use strict';

var db       = require('../../db')
  , User     = require('../model/user');

require('../model/user-sections');
require('../model/partner-sections');
require('dbjs-ext/string/string-line/password')(db);
User.prototype.$password.type = db.Password;

require('../../model/business-process/base')(db);

module.exports = db;
