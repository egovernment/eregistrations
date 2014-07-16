'use strict';
var ns = require('mano').domjs.ns;
/**
 * statusesToCheck - array of objects of the form: {status: dataStatus, msg: '', url: ''}
 * where dataStatus is a status Observable
 */

module.exports = function (statusesToCheck) {
	return ns.ul(statusesToCheck, function (item) {
		return ns._if(ns.not(ns.eq(item.status, 1)),
			ns.section({ class: 'prev-empty-alert' }, ns.a({ href: item.url }, item.msg)));
	});
};
