// Trigger collection resolver
// Utility used by notifications and statusLog features

'use strict';

var isObject = require('es5-ext/object/is-object')
  , mano     = require('mano');

module.exports = function (trigger, value, BusinessProcessType) {
	BusinessProcessType = BusinessProcessType || mano.db.BusinessProcess;

	if (trigger == null) throw new TypeError("No trigger found");
	if (typeof trigger === 'function') {
		if (mano.db.Object.isPrototypeOf(BusinessProcessType)) {
			return BusinessProcessType.filter(trigger);
		}
		return require('../users/users').filter(trigger);
	}
	if (isObject(trigger)) return trigger;
	if (mano.db.Object.isPrototypeOf(BusinessProcessType)) {
		return BusinessProcessType.filterByKey(trigger, (value === undefined) ? true : value);
	}
	return require('../users/users').filterByKey(trigger, (value === undefined) ? true : value);
};
