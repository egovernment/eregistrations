'use strict';

var d                   = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document/*, options */) {
		var self, headerRank, options;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		return ns.section({ class: 'entity-data-section' },
			headersMap[headerRank++](this.constructor.label),
			ns.ul({ class: 'entity-entities-section' },
				this.master.getDescriptor(this.constructor.propertyName).type.prototype.formSections,
				function (section) {
					if (!section) {
						return;
					}
					return ns.li(headersMap[headerRank](
						self.master.getObservable(self.constructor.entityTitleProperty)
					), section.toDOM(document, { headerRank: headerRank + 1 }));
				}
				)
			);
	}));
