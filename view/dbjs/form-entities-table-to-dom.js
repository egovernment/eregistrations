'use strict';

var _                   = require('mano').i18n.bind('Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
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
								return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
									resolvePropertyPath(
										self.master.getDescriptor(self.constructor.propertyName).type.prototype,
										entity.propertyName
									).descriptor.label);
							}), ns.th(),
								ns.th({ class: 'actions' }, _("Actions")))
						),
						ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
								ns.td({ colspan: this.constructor.entities.size + 2 },
									_("There are no elements added at the moment.")
								)
							) },
							resolvePropertyPath(this.master, this.constructor.propertyName).value,
							function (entityObject) {
								return ns.tr(ns.list(self.constructor.entities, function (entity) {
									return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
												ns._if(entity._mobileOnly, 'mobile-only')) },
											ns.a({ href: url(self.constructor.baseUrl, entityObject.__id__) },
												resolvePropertyPath(entityObject, entity.propertyName).observable));
								}),
									ns.td({ class: ns._if(ns.eq(resolvePropertyPath(entityObject,
													self.constructor.sectionProperty + 'Status').observable, 1),
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
							ns.tfoot(this.constructor.generateFooter(
								resolvePropertyPath(this.master, this.constructor.propertyName).value
							))
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
