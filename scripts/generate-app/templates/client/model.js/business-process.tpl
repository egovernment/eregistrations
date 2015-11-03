// Model definition for client side.

'use strict';

var db       = require('mano').db
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

require('../../../model/${ appName }');

module.exports = db;
