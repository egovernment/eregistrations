'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (sections) {
	var mainEntity = sections.object;
	sections.forEach(function (section) {
		section.toDOMForm(ns.document, mainEntity);
	});
};
