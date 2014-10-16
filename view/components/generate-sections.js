'use strict';

var _  = require('mano').i18n.bind('Sections')
  , ns = require('mano').domjs.ns
  , genFormSection, genFormSectionGroup, genFormEntitiesTable
  , mainSectionObject, url;

genFormSection = function (section) {
	ns.section({ class: 'section-primary' },
		ns.form(
			{ action: url(section.actionUrl), class: ns._if(ns.eq(
				mainSectionObject.getObservable(section.statusResolventProperty),
				1
			), 'completed') },
			ns.h2(section.label),
			ns.hr(),
			ns.fieldset(
				{ class: 'form-elements', dbjs: mainSectionObject, names:  section.propertyNames }
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
				mainSectionObject.getObservable(section.statusResolventProperty),
				1
			), 'completed')
			},
			ns.h2(section.label),
			ns.hr(),
			ns.list(section.sections, function (subSection) {
				return ns.div({ class: 'sub-section' },
					ns.h3(subSection.label),
					ns.fieldset(
						{ class: 'form-elements', dbjs: mainSectionObject, names:  subSection.propertyNames }
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
	ns.section({ class: 'section-primary' },
		ns.div(
			ns.div(
				ns.h2(section.label),
				ns.hr(),
				ns.table(
					{ class: 'entities-overview-table' },
					ns.thead(
						ns.tr(ns.list(section.entities, function (entity) {
							return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
									ns._if(entity._mobileOnly, 'mobileOnly')) },
								section.entityPrototype.getDescriptor(entity.propertyName).label);
						}), ns.th(),
							ns.th({ class: 'actions' }, _("Actions")))
					),
					ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
							ns.td({ colspan: section.entities.size + 2 },
								_("There are no elements added at the moment.")
							)
						) },
						mainSectionObject[section.propertyName], function (object) {
							return ns.tr(ns.list(section.entities, function (entity) {
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
									ns._if(entity._mobileOnly, 'mobileOnly')) },
									ns.a({ href: url(section.actionUrl) }, object[entity.propertyName]));
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
	mainSectionObject = sections.object;
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
