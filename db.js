// Initialisation of in-memory database engine used across system process

'use strict';

var Database        = require('dbjs')
  , _               = require('mano').i18n
  , d               = require('d')
  , resolveTemplate = require('es6-template-strings');

var db = module.exports = require('mano').db = new Database();

Object.defineProperties(db, {
	resolveTemplate: d(resolveTemplate)
});
Object.defineProperties(db.Base, {
	chooseLabel: d(_("Choose:"))
});
Object.defineProperties(db.Boolean, {
	trueLabel: d(_("Yes")),
	falseLabel: d(_("No"))
});
