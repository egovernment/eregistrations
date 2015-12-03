// Model definition for client side.

'use strict';

var db       = require('../../../db')
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;
require('../../../model/views');
require('../../../model/user/visited-business-processes');

module.exports = db;
