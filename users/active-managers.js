// Collection of all active managers

'use strict';

module.exports = require('mano').db.User.instances.filterByKey('isManagerActive');
