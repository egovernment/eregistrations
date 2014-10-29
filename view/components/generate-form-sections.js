'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections) {
	var result;
	result = [];
	sections.forEach(function (section) {
		result.push(ns._if(section._isApplicable, section.toDOMForm(ns.document)));
	});

	return result;
};
