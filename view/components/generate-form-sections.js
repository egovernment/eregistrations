'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections) {
	var mainEntity = sections.object;
	return ns.div(ns.list(sections, function (section) {
		ns.insert(ns._if(section._isApplicable, section.toDOMForm(ns.document, mainEntity)));
	}));
};
