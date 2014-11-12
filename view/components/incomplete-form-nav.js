'use strict';

var ns = require('mano').domjs.ns
  , _ = require('mano').i18n.bind('Incomplete Sections Navigation');

module.exports = function (sections) {
	return ns.ul(sections, function (section) {
		var msg;
		msg = section.msg || _('${sectionLabel} is incomplete',
			{ sectionLabel: section.constructor.label });
		return ns._if(ns.not(ns.eq(section._status, 1)),
			ns.section({ class: 'prev-empty-alert' }, ns.a({ href: '#' + section.domId }, msg)));
	});
};
