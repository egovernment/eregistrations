'use strict';

var d                   = require('d')
  , db                  = require('mano').db
  , headersMap          = require('../utils/headers-map')
  , getPropertyLabel    = require('../utils/get-property-label')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document/*, options */) {
		var self, headerRank, options, resolved, cssClass;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		resolved = resolvePropertyPath(this.propertyMaster, this.propertyName).value;
		if (resolved instanceof db.NestedMap) resolved = resolved.ordered;
		return section({ class: cssClass },
			(function () {
				if (self.label) {
					return [headersMap[headerRank++](self._label), hr()];
				}
				headerRank++;
			}()),
			_if(self._isUnresolved,
				function () {
					var resolvent = resolvePropertyPath(self.master, self.resolventProperty);

					return table(tbody(tr(th(getPropertyLabel(resolvent)), td(resolvent.observable))));
				}, function () {
					return _if(resolved._size,
						ul({ class: 'entity-data-section-entities' },
							resolved,
							function (entityObject) {
								var sectionsContainer;
								if (self.sectionProperty === 'dataForms') {
									sectionsContainer =
										resolvePropertyPath(entityObject, self.sectionProperty).value.applicable;
								} else {
									sectionsContainer = resolvePropertyPath(entityObject, self.sectionProperty).value;
								}
								return li(headersMap[headerRank](
									resolvePropertyPath(entityObject, self.entityTitleProperty).observable
								), list(sectionsContainer,
									function (section) {
										return _if(section._status, section.toDOM(document, {
											headerRank: headerRank + 1,
											viewContext: options.viewContext
										}));
									}));
							}),
						p({ class: 'entity-data-section-empty' }, self.onEmptyMessage));
				}));
	}));
