// Model definition for client side.

'use strict';

var db       = require('../../../db')
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

require('../../../model/institutions');
require('eregistrations/model/user/recently-visited/users')(db);
// Warning: ../../../model/views must be required after all business processes models
require('../../../model/views');

module.exports = db;
