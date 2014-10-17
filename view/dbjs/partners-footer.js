'use strict';

/*
partners section table custom footer
*/

var db = require('mano').db
  , ns = require('mano').domjs.ns;

db.partnersTable.define('generateFooter',
	{ value: function (propertyName) {
		return ns.tr(
			ns.th({ class: 'desktop-only' }, "Summary"),
			ns.th(""),
			ns.th({ class: 'desktop-only' }, "Directors no: 3"),
			ns.th({ class: 'desktop-only' }, "Subscriber no: 3"),
			ns.th({ class: 'desktop-only' }, ""),
			ns.th({ class: 'actions' }, "")
		);
	} });
