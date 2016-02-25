'use strict';

var register = require('../utils/manager-register-user');

// Add user
exports['user-add'] = {
	submit: register
};
