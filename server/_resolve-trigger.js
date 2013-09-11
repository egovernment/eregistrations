// Trigger collection resolver
// Utility used by notifications and statusLog features

'use strict';

var isObject = require('es5-ext/object/is-object')
  , users    = require('../users');

module.exports = function (trigger, value) {
	if (trigger == null) throw new TypeError("No trigger found");
	if (typeof trigger === 'function') return users.filter(trigger);
	if (isObject(trigger)) return trigger;
	return users.filterByProperty(trigger, (value === undefined) ? true : value);
};
