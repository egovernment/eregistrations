'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections/*, options */) {
	var headerRank, options;
	options = Object(arguments[1]);
	headerRank = options.headerRank || 3;
	return ns.div(ns.list(sections, function (section) {
		ns.insert(ns._if(section._isApplicable,
			section.toDOM(ns.document, { headerRank: headerRank })));
	}));
};
