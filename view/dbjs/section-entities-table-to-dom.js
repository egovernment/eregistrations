'use strict';

var d                   = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document/*, options */) {
		var self, headerRank, options, resolved;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		resolved = resolvePropertyPath(this.master, this.constructor.propertyName);
		return ns.section({ class: 'entity-data-section' },
			(function () {
				if (self.label) {
					return headersMap[headerRank++](self._label);
				}
				headerRank++;
			}()),
			ns.hr(),
			ns._if(resolved.value._size,
				ns.ul({ class: 'entity-data-section-entities' },
					resolved.value,
					function (entityObject) {
						return ns.li(headersMap[headerRank](
							resolvePropertyPath(entityObject, self.constructor.entityTitleProperty).value
						), ns.list(resolvePropertyPath(entityObject, self.constructor.sectionProperty).value,
							function (section) {
								return section.toDOM(document, { headerRank: headerRank + 1 });
							}));
					}
					), ns.p({ class: 'entity-data-section-empty' }, self.constructor.onEmptyMessage)));
	}));
