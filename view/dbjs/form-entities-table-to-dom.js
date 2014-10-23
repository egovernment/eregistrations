'use strict';

var _                   = require('mano').i18n.bind('Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , resolveObservable   = require('dbjs-dom/input/utils/resolve-observable')
  , ns = require('mano').domjs.ns
  , url;

url = ns.url;

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMForm',
	d(function (document) {
		var self = this;
		ns.section({ class: ns._if(ns.eq(
			this.status,
			1
		), 'section-primary completed', 'section-primary') },
			ns.div(
				ns.div(
					ns.h2(this.constructor.label),
					ns.hr(),
					ns.table(
						{ class: 'entities-overview-table' },
						ns.thead(
							ns.tr(ns.list(this.constructor.entities, function (entity) {
								var result;
								result = resolvePropertyPath(
									self.master.getDescriptor(self.constructor.propertyName).type.prototype,
									entity.propertyName
								);
								return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
										result.object.getDescriptor(result.key).label);
							}), ns.th(),
								ns.th({ class: 'actions' }, _("Actions")))
						),
						ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
								ns.td({ colspan: this.constructor.entities.size + 2 },
									_("There are no elements added at the moment.")
								)
							) },
							this.master[this.constructor.propertyName], function (entityObject) {
								return ns.tr(ns.list(self.constructor.entities, function (entity) {
									return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
												ns._if(entity._mobileOnly, 'mobile-only')) },
											ns.a({ href: url(self.constructor.baseUrl, entityObject.__id__) },
												resolveObservable(entityObject, entity.propertyName)));
								}),
									ns.td({ class: ns._if(ns.eq(entityObject.getObservable('completionStatus'), 1),
											'completed') },
										ns.span({ class: 'status-complete' }, "✓"),
										ns.span({ class: 'status-incomplete' }, "✕")),
									ns.td({ class: 'actions' },
										ns.a({ href: url(self.constructor.baseUrl, entityObject.__id__) }, _("Edit")),
										ns.postButton({ action: url(self.constructor.baseUrl,
											entityObject.__id__, 'delete'),
											value: _('Delete') })));
							}),
						this.constructor.generateFooter &&
							ns.tfoot(this.constructor.generateFooter(this.master[this.constructor.propertyName]))
					)
				)
			),
			ns.p(
				ns.a(
					{ class: 'new-entity', href: url(this.constructor.baseUrl + '-add') },
					_("Add new")
				)
			),
			ns.p({ class: 'button-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
					_("Back to top"))))
				);
	}));
