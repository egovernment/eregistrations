// Routes for public website

'use strict';

var bind = function (view) { return function (data, env) {
	view.scope = env;
	return view.load();
}; };

module.exports = function (view) {

	// All routes - no imported content, only header and #main to import elements
	var main = view.documentElement.diff('./_main'),
		// User routes - import content directly to #main element
		userLoggedIn = main.diff('./_user-logged-in'),
		userMain = userLoggedIn.diff('./_user-main'),
		subMain = userLoggedIn.diff('./_sub-main'),
		usersAdminMain = subMain.diff('./users-admin'),
		userOfficialMain = subMain.diff('./official'),
		userOfficialIcorporation = userOfficialMain.diff('./official-non-revision'),
		// For disablers
		userForm = userLoggedIn.diff('./forms'),
		userDocuments = userLoggedIn.diff('./documents');

	return {
		// Public routes - imports content directly to #main element
		'/': bind(main.diff('./index')),

		// User routes - imports content to #steps element in #main element
		'profile': bind(userMain.diff('./user-profile')),
		'guide': bind(userMain.diff('./guide')),
		'forms':  bind(userMain.diff('./forms')),
		'forms/disabled':  bind(userForm.diff('./disabled-forms')),
		'documents':  bind(userMain.diff('./documents')),
		'submission':  bind(userMain.diff('./submission')),
		'documents/disabled':  bind(userDocuments.diff('./disabled-documents')),
		'forms/partner-add': bind(userMain.diff('./partner-add')),
		'forms/partner-id': bind(userMain.diff('./partner')),
		'user-submitted': bind(subMain.diff('./user-submitted')),

		// Users admin routes
		'users-admin': bind(subMain.diff('./users-admin')),
		'users-admin/add-user': bind(usersAdminMain.diff('./add-user')),
		'users-admin/edit-user-id': bind(usersAdminMain.diff('./edit-user')),
		'users-admin/user-id': bind(usersAdminMain.diff('./users-admin-user')),

		// Official user routes
		'official': bind(subMain.diff('./official')),
		'official/revision/user-id': bind(userOfficialMain.diff('./official-revision')),
		'official/non-revision/user-id': bind(userOfficialMain.diff('./official-non-revision')),
		'official/non-revision/user-id/articles-incorporation': bind(
			userOfficialIcorporation.diff('./articles-incorporation')
		),
		// Error routes
		404: bind(main.diff('./404'))
	};
};
