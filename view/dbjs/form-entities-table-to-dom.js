'use strict';

var _                   = require('mano').i18n.bind('Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , ns = require('mano').domjs.ns;

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var self = this, options, url, customizeData;
		customizeData = {};
		url = ns.url;
		options = Object(arguments[1]);
		url = options.url || ns.url;
		customizeData.arrayResult = [customizeData.container = ns.section(
			{ id: this.domId, class: ns._if(ns.eq(
				this._status,
				1
			), 'section-primary completed entities-overview', 'section-primary entities-overview') },
			ns.div(
				ns.div(
					ns._if(this._label,
						[ns.h2(this._label),
							ns.hr()]),
					options.prepend,
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
									this.constructor.onEmptyMessage
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
										ns.a({ class: 'actions-edit',
												href: url(self.constructor.baseUrl, entityObject.__id__) },
											ns.span({ class: 'fa fa-edit' }, _("Edit"))),
										ns.postButton({ buttonClass: 'actions-delete',
												action: url(self.constructor.baseUrl,
												entityObject.__id__, 'delete'),
											value: ns.span({ class: 'fa fa-trash-o' },
												_("Delete")) })));
							}),
						this.constructor.generateFooter &&
							ns.tfoot(this.constructor.generateFooter(
								resolvePropertyPath(this.master, this.constructor.propertyName).value
							))
					),
					options.append
				)
			),
			ns.p(
				customizeData.addButton = ns.a(
					{ class: 'button-main', href: url(this.constructor.baseUrl + '-add') },
					options.addButtonLabel || _("Add new")
				)
			),
			ns.p({ class: 'section-primary-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
					_("Back to top"))))
		)];
		if (typeof options.customize === 'function') {
			options.customize.call(this, customizeData);
		}
		return customizeData.arrayResult;
	}));
