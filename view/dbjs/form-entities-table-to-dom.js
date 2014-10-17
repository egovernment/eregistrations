'use strict';

var _                   = require('mano').i18n.bind('Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , resolveObservable   = require('dbjs-dom/input/utils/resolve-observable')
  , ns = require('mano').domjs.ns
  , url;

url = ns.url;

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOM',
	d(function (document, mainEntity) {
		var self = this;
		ns.section({ class: ns._if(ns.eq(
			mainEntity.getObservable(this.statusResolventProperty),
			1
		), 'section-primary completed', 'section-primary') },
			ns.div(
				ns.div(
					ns.h2(this.label),
					ns.hr(),
					ns.table(
						{ class: 'entities-overview-table' },
						ns.thead(
							ns.tr(ns.list(this.entities, function (entity) {
								var result;
								result = resolvePropertyPath(mainEntity, entity.propertyName);
								return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
										result.object.getDescriptor(result.key).label);
							}), ns.th(),
								ns.th({ class: 'actions' }, _("Actions")))
						),
						ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
								ns.td({ colspan: this.entities.size + 2 },
									_("There are no elements added at the moment.")
								)
							) },
							mainEntity[this.propertyName], function (object) {
								return ns.tr(ns.list(self.entities, function (entity) {
									return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
												ns._if(entity._mobileOnly, 'mobile-only')) },
											ns.a({ href: url(self.actionUrl) },
												resolveObservable(object, entity.propertyName)));
								}),
									ns.td({ class: ns._if(ns.eq(object.getObservable('completionStatus'), 1),
											'completed') },
										ns.span({ class: 'status-complete' }, "✓"),
										ns.span({ class: 'status-incomplete' }, "✕")),
									ns.td({ class: 'actions' },
										ns.a(_("Edit")),
										ns.postButton({ action: '', value: _('Delete') })));
							}),
						this.generateFooter &&
							ns.tfoot(this.generateFooter(mainEntity[this.propertyName]))
					)
				)
			),
			ns.p(
				ns.a(
					{ class: 'new-entity', href: url(this.actionUrl) },
					_("Add new")
				)
			),
			ns.p({ class: 'button-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
					_("Back to top"))))
				);
	}));
