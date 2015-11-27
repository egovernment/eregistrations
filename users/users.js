// Collection of all users (registered accounts with 'user' role)

'use strict';

module.exports = require('mano').db.User.find('roles', 'user');
