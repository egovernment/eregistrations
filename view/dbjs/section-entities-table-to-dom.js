'use strict';

var d                   = require('d')
  , db = require('mano').db
  , generateSections = require('../components/generate-sections');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document, mainEntity/*, options */) {
		var headerRank, options;
		options = Object(arguments[2]);
		headerRank = options.headerRank || 4;
		return generateSections(
			mainEntity.getDescriptor(this.propertyName).type.prototype.formSections,
			{ headerRank: headerRank }
		);
	}));
