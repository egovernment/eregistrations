// Model definition for client side.

'use strict';

var db       = require('mano').db
  , User     = require('../../../model/user/base')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

require('../../../model/user/roles');
require('../../../model/institutions');

module.exports = db;
