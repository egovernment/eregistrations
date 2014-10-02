'use strict';

var db           = require('mano').db
  , User         = require('mano-auth/model/user')(db);

User.prototype.defineProperties({
	certificates: {
		type: db.Object,
		nested: true
	}
});
