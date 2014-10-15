'use strict';

var _  = require('mano').i18n.bind('User: Forms')
  , ns = require('mano').domjs.ns
  , genFormSection, genFormSectionGroup, genFormEntitiesTable
  , user, url;

genFormSection = function (section) {
	ns.section({ class: 'section-primary' },
		ns.form(
			{ action: url(section.actionUrl), class: 'completed' },
			ns.h2(section.label),
			ns.hr(),
			ns.fieldset(
				{ class: 'form-elements' },
				ns.ul(
					section.propertyNames,
					function (name) {
						return ns.field({ dbjs: user.getObservable(name) });
					}
				)
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
		ns.form({ action: url(section.actionUrl) },
			ns.h2(section.label),
			ns.hr(),
			ns.list(section.sections, function (subSection) {
				return ns.div({ class: 'sub-section' },
					ns.h3(subSection.label),
					ns.fieldset(
						{ class: 'form-elements' },
						ns.ul(subSection.propertyNames,
							function (name) {
								return ns.field({ dbjs: user.getObservable(name) });
							})
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
								entity.label);
						}), ns.th({ class: 'desktop-only' }, ""),
							ns.th({ class: 'actions' }, _("Actions")))
					),
					ns.tbody({ onEmpty: ns.tr({ class: 'empty' },
							ns.td({ colspan: section.entities.size + 2 },
								_("There are no elements added at the moment.")
							)
						) },
						user[section.propertyName], function (object) {
							return ns.tr(ns.list(section.entities, function (entity) {
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
									ns._if(entity._mobileOnly, 'mobileOnly')) },
									ns.a({ href: url(section.actionUrl) }, object[entity.propertyName]));
							}),
								ns.td({ class: 'desktop-only confirmed' }, "✓"),
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
	user = sections.object;
	url = ns.url;
	sections.forEach(function (section) {
		switch (section.constructor.__id__) {
		case 'FormSection':
			genFormSection(section);
			break;
		case 'FormSectionGroup':
			genFormSectionGroup(section);
			break;
		case 'FormEntitiesTable':
			genFormEntitiesTable(section);
			break;
		}
	});
};
