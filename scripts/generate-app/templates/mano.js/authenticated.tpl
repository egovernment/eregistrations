//Application top configuration.

'use strict';

var db = require('mano').db;

exports.route = function (req) {
	var user = req.$user && db.User.getById(req.$user);
	if (!user || user.currentRoleResolved !== 'user') {
		return false;
	}
	return true;
};
exports.forceLegacyFullRender = true;
exports.viewPath = '../../view/${ appName }';
