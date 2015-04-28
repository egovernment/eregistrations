// Trigger collection resolver
// Utility used by notifications and statusLog features

'use strict';

var isObject = require('es5-ext/object/is-object')
  , db       = require('mano').db
  , users    = require('../users');

module.exports = function (trigger, value) {
	if (trigger == null) throw new TypeError("No trigger found");
	if (typeof trigger === 'function') {
		if (db.Object.isPrototypeOf(db.BusinessProcess)) return db.BusinessProcess.filter(trigger);
		return users.filter(trigger);
	}
	if (isObject(trigger)) return trigger;
	if (db.Object.isPrototypeOf(db.BusinessProcess)) {
		return db.BusinessProcess.filterByKey(trigger, (value === undefined) ? true : value);
	}
	return users.filterByKey(trigger, (value === undefined) ? true : value);
};
