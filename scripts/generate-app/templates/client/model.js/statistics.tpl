// Model definition for client side.

'use strict';

var db       = require('../../../db')
  , User     = require('../../../model/user/roles')
  , Password = require('dbjs-ext/string/string-line/password')(db)

  , user = User.prototype;

user.$password.type = Password;

require('../../../model/views');
require('../../../model/statistics');

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	if (!BusinessProcess.prototype.label) {
		throw new Error('Set label attribute for: ' + BusinessProcess.__id__);
	}
});

module.exports = db;
