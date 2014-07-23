// Routes for public website

'use strict';

var bind = function (view) { return function (data, env) {
	view.scope = env;
	return view.load();
}; };

module.exports = function (view) {

	// All pages - no imported content, only header and #main to import elements
	var main = view.documentElement.diff('./_main'),
		// User Pages - import content directly to #main element
		userMain = main.diff('./_user-main');

	return {
		// Public pages - imports content directly to #main element
		'/': bind(main.diff('./index')),
		404: bind(main.diff('./404')),

		// User pages - imports content to #steps element in #main element
		'forms':  bind(userMain.diff('./forms')),
		'guide': bind(userMain.diff('./guide'))
	};
};
