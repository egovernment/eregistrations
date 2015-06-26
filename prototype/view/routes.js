// Configuration of URL routes for a prototype website

'use strict';

module.exports = {
	'/': require('./view/index'),
	public: require('./view/public'),
	'reset-password': require('./view/reset-password'),
	'multi-entry': require('./view/multi-entry')

};
