// Initialisation of in-memory database engine used across system process

'use strict';

var _               = require('mano').i18n
  , d               = require('d')
  , resolveTemplate = require('es6-template-strings');

var db = module.exports = require('mano').db;

db.locale = 'en-GB'; // default locale, to be shadowed with expected one in end system

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
