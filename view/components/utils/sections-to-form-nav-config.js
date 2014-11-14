'use strict';

var _ = require('mano').i18n.bind('Incomplete Sections Navigation');

module.exports = function (sections) {
	var config = [], configItem;
	sections.forEach(function (section) {
		configItem = {};
		configItem.msg = section.msg || _('${sectionLabel} is incomplete',
			{ sectionLabel: section.constructor.label });
		configItem.status = section._status;
		configItem.url = '#' + section.domId;
		config.push(configItem);
	});
	return config;
};
