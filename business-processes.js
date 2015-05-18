// Collection of all business processes which where made online

'use strict';

module.exports = require('mano').db.BusinessProcess.instances.filterByKey('isFromEregistrations',
	true);
