'use strict';

var Database = require('dbjs')
  , defineDocument = require('../../../model/document');

module.exports = function (t, a) {
	var db = new Database()
	  , Document = defineDocument(db)
	  , TestDocument = Document.extend('TestDocument')
	  , FormUpToDateConfirmation = t(db, { parent: TestDocument })

	  , formUpToDateConfirmation = new FormUpToDateConfirmation();

	a(formUpToDateConfirmation instanceof TestDocument, true);
};
