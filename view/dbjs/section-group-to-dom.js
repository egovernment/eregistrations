'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOM',
	d(function (document/*,options */) {
		var headerRank, cssClass, options;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		return ns.section({ class: cssClass },
			this.label && headersMap[headerRank](this.label),
			ns.list(this.sections, function (section) {
				return section.toDOM(document, { headerRank: headerRank + 1,
					cssClass: 'entity-data-sub-section' });
			})
			);
	}));
