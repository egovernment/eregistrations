'use strict';

var d  = require('d')
  , db = require('mano').db;

require('./form-section-base-get-resolvent');
require('./form-section-base-get-legacy');
require('./form-section-base-dom-id');

Object.defineProperties(db.FormSectionBase.prototype, {
	disablePartialSubmit: d(false)
});
