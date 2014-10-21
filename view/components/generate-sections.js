'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections/*, options */) {
	var mainEntity, headerRank, options;
	mainEntity = sections.object;
	options = Object(options);
	headerRank = options.headerRank || 4;
	return ns.div(ns.list(sections, function (section) {
		ns.insert(ns._if(section._isApplicable,
			section.toDOM(ns.document, mainEntity, { headerRank: headerRank })));
	}));
};
