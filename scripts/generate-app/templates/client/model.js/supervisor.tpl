// Model definition for client side.

'use strict';

var db       = require('../../../db')
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

require('../../../model/user/recently-visited/business-processes');

require('../../../model/views');

//TODO: Require all business processes services models

module.exports = db;
