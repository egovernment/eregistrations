'use strict';

/*
partners section table custom footer
*/

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.PartnersTable.prototype, 'generateFooter',
	d(function (propertyName) {
		return ns.tr(
			ns.th("Summary"),
			ns.th(""),
			ns.th({ class: 'desktop-only' }, "Directors no: 3"),
			ns.th({ class: 'desktop-only' }, "Subscriber no: 3"),
			ns.th(""),
			ns.th({ class: 'actions' }, "")
		);
	}));
