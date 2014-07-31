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
		userMain = main.diff('./_user-main'),
		subPublic = main.diff('./sub-public'),
		subPublicPart1 = subPublic.diff('./part1'),
		subPublicPart1Page1 = subPublicPart1.diff('./part1page1'),
		subPublicPart1Page1Tab2 = subPublicPart1Page1.diff('./part1page1tab2');

	return {
		// Public routes - imports content directly to #main element
		'/': bind(main.diff('./index')),
		'subpublic': bind(subPublicPart1Page1Tab2),
		// User routes - imports content to #steps element in #main element
		'guide': bind(userMain.diff('./guide')),
		'forms':  bind(userMain.diff('./forms')),
		'documents':  bind(userMain.diff('./documents')),
		'forms/partner-add': bind(userMain.diff('./partner-add')),
		'forms/partner-id': bind(userMain.diff('./partner')),

		// Error routes
		404: bind(main.diff('./404'))
	};
};
