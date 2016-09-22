'use strict';

var location = require('mano/lib/client/location');

module.exports = function (href, label/*, options */) {
	var options = Object(arguments[2]), pattern;
	pattern = options.pattern || new RegExp('^' + href);
	return li({ class: [_if(location._pathname.map(function (pathname) {
			if (!pathname) return;
		return pattern.test(pathname);
	}),
		'submitted-menu-item-active')] }, a({ href: href }, label));
};
