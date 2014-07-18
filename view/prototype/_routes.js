// Routes for public website

'use strict';

var bind = function (view) { return function (data, env) {
	view.scope = env;
	return view.load();
}; };

module.exports = function (view) {
	var main = view.documentElement.diff('./_main');

	return {
		'/': bind(main.diff('./index')),
		'forms':  bind(main.diff('./forms')),

		// 404 page
		404: bind(main.diff('./404')),
		'guide': bind(main.diff('./guide'))
	};
};
