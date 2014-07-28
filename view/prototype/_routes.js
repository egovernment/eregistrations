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
		userMain = main.diff('./_user-main');

	return {
		// Public routes - imports content directly to #main element
		'/': bind(main.diff('./index')),

		// User routes - imports content to #steps element in #main element
		'guide': bind(userMain.diff('./guide')),
		'forms':  bind(userMain.diff('./forms')),
		'docs':  bind(userMain.diff('./docs')),
		'forms/partner-add': bind(userMain.diff('./partner-add')),
		'forms/partner-id': bind(userMain.diff('./partner')),

		// Error routes
		404: bind(main.diff('./404'))
	};
};
