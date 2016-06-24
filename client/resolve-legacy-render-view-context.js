'use strict';

module.exports = function (db, clientId, viewContext) {
	var tokens = clientId.split('_')
	  , accessId = tokens[2]
	  , user, userId, roleName, businessProcessId;

	if (!accessId) return;
	tokens = accessId.split('.');
	userId = tokens[0];
	roleName = tokens[1];
	user = db.User.getById(userId);
	if (roleName === 'manager') {
		userId = tokens[2];
		businessProcessId = tokens[3];
		if (userId) {
			viewContext.manager = user;
			viewContext.user = db.User.getById(userId);
			if (businessProcessId) {
				viewContext.businessProcess = db.BusinessProcess.getById(businessProcessId);
			}
			return;
		}
	}
	viewContext.user = user;
	if (roleName === 'user') {
		businessProcessId = tokens[2];
		if (businessProcessId) {
			viewContext.businessProcess = db.BusinessProcess.getById(businessProcessId);
		}
	}
};
