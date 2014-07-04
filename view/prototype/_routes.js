// Routes for public website

'use strict';

var bind = function (view) { return function (data, env) {
	view.scope = env;
	return view.load();
}; };

console.log("routes")
module.exports = function (view) {
	var main = view.documentElement.diff('./_main');

	return {
		'/': bind(main.diff('./index')),
		'public-inner':  bind(main.diff('./public-inner')),

		// 404 page
		404: bind(main.diff('./404'))
	};
};
