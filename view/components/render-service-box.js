'use strict';

var _ = require('mano').i18n.bind('View: Render Service Box');

module.exports = function (item) {
	var disabled = item.disabledCondition
	  , renderAsForm = item.actionUrl != null ? and(item.actionUrl, not(disabled)) : false
	  , renderAsDiv = not(renderAsForm)
	  , boxClasses = [ 'user-account-service-box', _if(disabled, 'disabled') ];

	// Explanation of superfluous _if usage within configuration below:
	// As item.content and item.buttonContent can be used in two scenarios (form and aHref)
	// which may toggle during time of interface being displayed, we need to ensure that
	// very same DOM content is moved between two containers, and that can only be ensured
	// with extra `_if(cond, item.x)` calls (otherwise those `_if` have no real function)
	return _if(item.condition || true, li(_if(
		renderAsForm,
		form({ class: boxClasses, action: item.actionUrl, method: 'post' },
			button({ type: 'submit' }, _if(renderAsForm, item.buttonContent)),
			div(div({ class: 'free-form' }, _if(renderAsForm, item.content)),
				p(button({ type: 'submit' },
					i({ class: 'fa fa-angle-right' }), _('Click to start'))))),
		div({ class: boxClasses },
			a({ href: _if(disabled, null, item.hrefUrl) },
				_if(renderAsDiv, item.buttonContent)),
			div(div({ class: 'free-form' }, _if(renderAsDiv, item.content)),
				p(a({ href: _if(disabled, null, item.hrefUrl) },
					i({ class: 'fa fa-angle-right' }), _if(disabled,
						_('You have reached the draft limit for this service'),
						_('Click to start'))))))
	)));
};
