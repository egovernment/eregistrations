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
		userLogedIn = main.diff('./_user-loged-in'),
		userMain = userLogedIn.diff('./_user-main'),
		subMain = userLogedIn.diff('./_sub-main'),
		// For disablers
		userForm = userLogedIn.diff('./forms'),
		userDocuments = userLogedIn.diff('./documents');

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

		// Error routes
		404: bind(main.diff('./404')),

		// Site admin routes
		'site-admin': bind(subMain.diff('./site-admin'))
	};
};
