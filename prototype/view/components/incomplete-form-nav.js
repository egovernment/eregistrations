/** @param {array} statusesToCheck - Array of objects of the form:
 * {status: dataStatus, msg: '', url: ''}
 * where dataStatus is a status Observable
 * @returns a domjs list with links to incomplete items
 */

'use strict';

var ns = require('mano').domjs.ns;

module.exports = function (statusesToCheck) {
	return ns.ul(statusesToCheck, function (item) {
		return ns._if(ns.not(ns.eq(item.status, 1)),
			ns.section(ns.a({ href: item.url }, item.msg)));
	});
};
