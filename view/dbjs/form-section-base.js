'use strict';

var d = require('d')
  , db = require('mano').db
  , lazy = require('d/lazy')
  , assign = require('es5-ext/object/assign');

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');
require('./form-section-base-form-html-id');

Object.defineProperties(db.FormSectionBase.prototype, assign({
	forceRequiredInput: d(false)
}, lazy({
	domId: d(function () {
		return this.formHtmlId;
	})
})));
