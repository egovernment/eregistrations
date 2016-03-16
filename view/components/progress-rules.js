'use strict';

var _  = require('mano').i18n.bind('View: Progress rules')
  , _d = _;

module.exports = function (section/*, options */) {
	return _if(not(section._isUnresolved),
		_if(gtOrEq(section.progressRules.displayable._size, 1),
			div({ class: 'entities-overview-info' },
				_if(eq(section.progressRules.displayable._size, 1),
					p(section.progressRules.displayable._first.map(function (rule) {
						if (!rule) return;
						return _d(rule.message, rule.getTranslations());
					})),
					ul(section.progressRules.displayable,
						function (rule) {
							if (!rule.message) return;
							return li(_d(rule.message, rule.getTranslations()));
						})))));
};
