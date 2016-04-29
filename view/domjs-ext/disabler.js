'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , isPlainObject    = require('es5-ext/object/is-plain-object')
  , assign           = require('es5-ext/object/assign')
  , slice            = Array.prototype.slice;

module.exports = function (domjs/*, options*/) {
	var options     = normalizeOptions(arguments[1])
	  , elementName = options.name || 'disabler'
	  , div         = domjs.ns.div
	  , _if         = domjs.ns._if;

	domjs.ns[elementName] = function (attrs, disableCondition/*, …content*/) {
		if (isPlainObject(attrs)) {
			content = slice.call(arguments, 2);
		} else {
			disableCondition = attrs;
			attrs = {};
			content = slice.call(arguments, 1);
		}

		assign(attrs, { class: ['disabler-range', _if(disableCondition, 'disabler-active')] });

		return div(attrs, div({ class: 'disabler' }), content);
	};
};
