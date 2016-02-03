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
		resolved = resolvePropertyPath(this.propertyMaster, this.propertyName).value;
		if (resolved instanceof db.NestedMap) resolved = resolved.ordered;
		return ns.section({ class: cssClass },
			(function () {
				if (self.label) {
					return [headersMap[headerRank++](self._label), ns.hr()];
				}
				headerRank++;
			}()),
			ns._if(self._isUnresolved,
				function () {
					var resolvedResolvent = resolvePropertyPath(self.master, self.resolventProperty)
					  , descriptor        = resolvedResolvent.descriptor
					  , dynamicLabelKey   = descriptor.dynamicLabelKey
					  , label             = dynamicLabelKey ?
							descriptor.object.getObservable(dynamicLabelKey) : descriptor.label;

					return ns.table(ns.tbody(ns.tr(ns.th(label), ns.td(resolvedResolvent.observable))));
				}, function () {
					return ns._if(resolved._size,
						ns.ul({ class: 'entity-data-section-entities' },
							resolved,
							function (entityObject) {
								var sectionsContainer;
								if (self.sectionProperty === 'dataForms') {
									sectionsContainer =
										resolvePropertyPath(entityObject, self.sectionProperty).value.applicable;
								} else {
									sectionsContainer = resolvePropertyPath(entityObject, self.sectionProperty).value;
								}
								return ns.li(headersMap[headerRank](
									resolvePropertyPath(entityObject, self.entityTitleProperty).observable
								), ns.list(sectionsContainer,
									function (section) {
										return _if(section._status, section.toDOM(document, {
											headerRank: headerRank + 1,
											viewContext: options.viewContext
										}));
									}));
							}),
						ns.p({ class: 'entity-data-section-empty' }, self.onEmptyMessage));
				}));
	}));
