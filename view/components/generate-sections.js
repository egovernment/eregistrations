'use strict';

var _  = require('mano').i18n.bind('Sections')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , resolveObservable   = require('dbjs-dom/input/utils/resolve-observable')
  , ns = require('mano').domjs.ns
  , genFormSection, genFormSectionGroup, genFormEntitiesTable
  , mainEntity, url;

genFormSection = function (section) {
	ns.section({ class: 'section-primary' },
		ns.form(
			{ action: url(section.actionUrl), class: ns._if(ns.eq(
				mainEntity.getObservable(section.statusResolventProperty),
				1
			), 'completed') },
			ns.h2(section.label),
			ns.hr(),
			ns.fieldset(
				{ class: 'form-elements', dbjs: mainEntity, names:  section.propertyNames }
			),
			ns.p({ class: 'submit-placeholder input' },
				ns.input({ type: 'submit' }, _("Submit"))),
			ns.p({ class: 'button-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' },
					ns.span({ class: 'fa fa-arrow-up' }, _("Back to top"))))
		));
};

genFormSectionGroup = function (section) {
	ns.section(
		{ class: 'section-primary' },
		ns.form({ action: url(section.actionUrl), class:
			ns._if(ns.eq(
				mainEntity.getObservable(section.statusResolventProperty),
				1
			), 'completed')
			},
			ns.h2(section.label),
			ns.hr(),
			ns.list(section.sections, function (subSection) {
				return ns.div({ class: 'sub-section' },
					ns.h3(subSection.label),
					ns.fieldset(
						{ class: 'form-elements', dbjs: mainEntity,  names: subSection.propertyNames }
					));
			}),
			ns.p({ class: 'submit-placeholder input' },
				ns.input({ type: 'submit' }, _("Submit"))),
			ns.p(
				{ class: 'button-scroll-top' },
				ns.a({ onclick: 'window.scroll(0, 0)' },
					ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
			)
			)
	);
};

genFormEntitiesTable = function (section) {
	ns.section({ class: ns._if(ns.eq(
		mainEntity.getObservable(section.statusResolventProperty),
		1
	), 'section-primary completed', 'section-primary') },
		ns.div(
			ns.div(
				ns.h2(section.label),
				ns.hr(),
				ns.table(
					{ class: 'entities-overview-table' },
					ns.thead(
						ns.tr(ns.list(section.entities, function (entity) {
							var result;
							result = resolvePropertyPath(section.entityPrototype, entity.propertyName);
							return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
									ns._if(entity._mobileOnly, 'mobile-only')) },
								result.object.getDescriptor(result.key).label);
						}), ns.th(),
							ns.th({ class: 'actions' }, _("Actions")))
					),
					ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
							ns.td({ colspan: section.entities.size + 2 },
								_("There are no elements added at the moment.")
							)
						) },
						mainEntity[section.propertyName], function (object) {
							return ns.tr(ns.list(section.entities, function (entity) {
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
									ns._if(entity._mobileOnly, 'mobile-only')) },
									ns.a({ href: url(section.actionUrl) },
										resolveObservable(object, entity.propertyName)));
							}),
								ns.td({ class: ns._if(ns.eq(object.getObservable('completionStatus'), 1),
										'completed') },
									ns.span({ class: 'status-complete' },  "✓"),
									ns.span({ class: 'status-incomplete' },  "✕")),
								ns.td({ class: 'actions' },
									ns.a(_("Edit")),
									ns.postButton({ action: '', value: _('Delete') })));
						})
				)
			)
		),
		ns.p(
			ns.a(
				{ class: 'new-entity', href: url(section.actionUrl) },
				_("Add new")
			)
		),
		ns.p({ class: 'button-scroll-top' },
			ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
				_("Back to top"))))
		);
};

module.exports = function (sections) {
	var db;
	db = sections.object.database;
	mainEntity = sections.object;
	url = ns.url;
	sections.forEach(function (section) {
		switch (section.constructor) {
		case db.FormSection:
			genFormSection(section);
			break;
		case db.FormSectionGroup:
			genFormSectionGroup(section);
			break;
		case db.FormEntitiesTable:
			genFormEntitiesTable(section);
			break;
		}
	});
};
