// Server-only GET router

'use strict';

module.exports = require('eregistrations/server/routes/supervisor')({
	// TODO: Choose proper businessProcess storage
	storage: require('mano').dbDriver.getStorage('businessProcessTODO')
});
