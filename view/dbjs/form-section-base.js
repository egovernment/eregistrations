'use strict';

var d = require('d')
  , db = require('mano').db
  , lazy = require('d/lazy')
  , assign = require('es5-ext/object/assign')
  , generateId = require('dom-ext/html-document/generate-id');

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');

Object.defineProperties(db.FormSectionBase.prototype, assign({
	forceRequiredInput: d(false)
}, lazy({
	domId: d(function () {
		return generateId(this.constructor.label);
	})
})));
