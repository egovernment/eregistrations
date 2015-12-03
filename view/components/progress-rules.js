'use strict';

var _  = require('mano').i18n.bind('View: Progress rules');

module.exports = function (section/*, options */) {
	var translationInserts, _d = _;
	translationInserts = Object(arguments[1]).translationInserts;
	return _if(not(section._isUnresolved),
		_if(gtOrEq(section.progressRules.displayable._size, 1),
			div({ class: 'entities-overview-info' },
				_if(eq(section.progressRules.displayable._size, 1),
					p(section.progressRules.displayable._first.map(function (rule) {
						if (!rule) return;
						return _d(rule.message, translationInserts);
					})),
					ul(section.progressRules.displayable,
						function (rule) {
							if (!rule.message) return;
							return li(_d(rule.message, translationInserts));
						})))));
};
