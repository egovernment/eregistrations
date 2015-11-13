// Model definition for client side.

'use strict';

var db       = require('../../../db')
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

// TODO: Remove below line as soon as first business process service is added
require('../../../model/business-process/base');

module.exports = db;
