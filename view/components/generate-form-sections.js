'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections) {
	return ns.div(ns.list(sections, function (section) {
		ns.insert(ns._if(section._isApplicable, section.toDOMForm(ns.document)));
	}));
};
