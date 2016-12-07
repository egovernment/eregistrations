'use strict';

var db             = require('../../db')
  , stringify      = JSON.stringify
  , submitterTypes = db.BusinessProcess.prototype.getDescriptor('submitterType').type.members;

module.exports = {
	name: 'submitterType',
	ensure: function (value) {
		if (!value) return;

		if (!submitterTypes.has(value)) {
			throw new Error("Unrecognized user type value " + stringify(value));
		}

		return value;
	}
};
