// Trigger collection resolver
// Utility used by notifications and statusLog features

'use strict';

var isObject = require('es5-ext/object/is-object')
  , db       = require('mano').db
  , users    = require('../users/users');

module.exports = function (trigger, value, BusinessProcessType) {
	BusinessProcessType = BusinessProcessType || db.BusinessProcess;

	if (trigger == null) throw new TypeError("No trigger found");
	if (typeof trigger === 'function') {
		if (db.Object.isPrototypeOf(BusinessProcessType)) return BusinessProcessType.filter(trigger);
		return users.filter(trigger);
	}
	if (isObject(trigger)) return trigger;
	if (db.Object.isPrototypeOf(BusinessProcessType)) {
		return BusinessProcessType.filterByKey(trigger, (value === undefined) ? true : value);
	}
	return users.filterByKey(trigger, (value === undefined) ? true : value);
};
