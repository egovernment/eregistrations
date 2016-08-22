'use strict';

var db         = require('../../db')
  , toIdent    = require('mano/lib/utils/to-ident')
  , extname    = require('path').extname
  , defResolve = require('dbjs-file/lib/resolve-file-name');

var resolveDocument = function (dbFile) {
	var owner = dbFile.owner;

	while (owner && !(owner instanceof db.Document)) {
		owner = owner.owner;
	}

	return owner;
};

module.exports = function (dbFile, file) {
	var resolvedDocument = resolveDocument(dbFile)
	  , businessName     = dbFile.master.businessName;

	if (resolvedDocument) {
		return dbFile.master.__id__ + '/' + dbFile.__sKey__ +
			(businessName ? ('-' + toIdent(businessName) + '-') : '-') +
			toIdent(resolvedDocument.label).slice(0, 50) + extname(file.name);
	}

	return defResolve(dbFile, file);
};
