'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns;

Object.defineProperties(db.User.prototype.getDescriptor('notification'), {
	inputOptions: d({
		type: 'radio',
		class: 'multiline',
		renderOption: function (labelTxt) {
			var data = {};
			data.dom = ns.li(ns.label({ class: 'input-aside' },
				ns.span(data.input = ns.input()),
				ns.span(labelTxt)));
			return data;
		}
	})
});
