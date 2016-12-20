// Resolves list of all business process services names in form of set as:
// { merchant, company, solvency }

'use strict';

var uncapitalize = require('es5-ext/string/#/uncapitalize')
  , Set          = require('es6-set')
  , db           = require('../db');

if (!db.BusinessProcess) {
	throw new Error("Cannot resolve business process service names, model not loaded");
}

module.exports = exports = new Set();

db.BusinessProcess.extensions.forEach(function (type) {
	exports.add(uncapitalize.call(type.__id__.slice('BusinessProcess'.length)));
});
