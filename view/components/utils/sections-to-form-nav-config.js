'use strict';

var _ = require('mano').i18n.bind('Incomplete Sections Navigation');

module.exports = function (sections) {
	var config = [], configItem;
	sections.forEach(function (section) {
		configItem = {};
		configItem.msg = section.onIncompleteMessage || _("${sectionLabel} is incomplete",
			{ sectionLabel: section.label });
		configItem.status = section._status;
		configItem.url = '#' + section.domId;
		config.push(configItem);
	});
	return config;
};
