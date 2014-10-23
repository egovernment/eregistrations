'use strict';

var d                   = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document/*, options */) {
		var self, headerRank, options;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		return ns.section({ class: 'entity-data-section' },
			(function () {
				if (self.constructor.label) {
					return headersMap[headerRank++](self.constructor.label);
				}
				headerRank++;
			}()),
			ns.ul({ class: 'entity-entities-section' },
				resolvePropertyPath(
					this.master,
					this.constructor.propertyName
				).descriptor.type.prototype.formSections,
				function (section) {
					if (!section) {
						return;
					}
					return ns.li(headersMap[headerRank](
						resolvePropertyPath(self.master, self.constructor.entityTitleProperty).value
					), section.toDOM(document, { headerRank: headerRank + 1 }));
				}
				)
			);
	}));
