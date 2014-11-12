'use strict';

var d = require('d')
  , db = require('mano').db
  , lazy = require('d/lazy')
  , generateId = require('dom-ext/html-document/generate-id');

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');

Object.defineProperties(db.FormSectionBase.prototype, lazy({
	domId: d(function () {
		return generateId(this.constructor.label);
	})
}));
