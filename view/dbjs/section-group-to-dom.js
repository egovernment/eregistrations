'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOM',
	d(function (document, mainEntity) {
		var headerRank, options;
		options = Object(arguments[2]);
		headerRank = options.headerRank || 4;
		return ns.div(
			headersMap[headerRank](this.label),
			ns.list(this.sections, function (section) {
				return section.toDOM(document, mainEntity, { headerRank: headerRank + 1 });
			})
		);
	}));
