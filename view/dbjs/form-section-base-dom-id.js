'use strict';

var d          = require('d')
  , db         = require('mano').db
  , toIdString = require('dom-ext/html-document/to-id-string');

Object.defineProperties(db.FormSectionBase.prototype, {
	domId: d.gs(function () {
		return toIdString(this.label || this.__sKey__);
	})
});
