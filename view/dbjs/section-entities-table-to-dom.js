'use strict';

var d                   = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document/*, options */) {
		var self, headerRank, options, resolved, cssClass;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		resolved = resolvePropertyPath(this.master, this.propertyName);
		return ns.section({ class: cssClass },
			(function () {
				if (self.label) {
					return [headersMap[headerRank++](self._label), ns.hr()];
				}
				headerRank++;
			}()),
			ns._if(resolved.value._size,
				ns.ul({ class: 'entity-data-section-entities' },
					resolved.value,
					function (entityObject) {
						return ns.li(headersMap[headerRank](
							resolvePropertyPath(entityObject, self.entityTitleProperty).observable
						), ns.list(resolvePropertyPath(entityObject, self.sectionProperty).value,
							function (section) {
								return section.toDOM(document, { headerRank: headerRank + 1 });
							}));
					}
					), ns.p({ class: 'entity-data-section-empty' }, self.onEmptyMessage)));
	}));
