'use strict';

var validDbType = require('dbjs/valid-dbjs-type');

module.exports = function (Target) {
	validDbType(Target);
	require('./registrations')(Target);
	require('./costs')(Target);
	require('./requirements')(Target);
	require('./certificates')(Target);

	return Target;
};
