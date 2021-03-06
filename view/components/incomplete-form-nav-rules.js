// Draw list of not completed sections rules.

'use strict';

var db = require('mano').db
  , _  = require('mano').i18n.bind('View: Component: Incomplete sections')

  , _d = _
  , generateMissingList;

var entityLabel = function (tableSection, entity) {
	return entity.resolveSKeyPath(tableSection.entityTitleProperty).observable;
};

var displayableRulesLabel = function () {
	return p(_("Following problems occur:"));
};

var sectionLabel = function (formSection, level) {
	var title;
	if (level === 0) return displayableRulesLabel();

	if (formSection.label) {
		title = _("In _\"${ sectionLabel }\"_ section:", { sectionLabel: formSection.label });
	} else {
		title = _("In main section:");
	}
	return p({ class: 'section-warning-missing-fields-sub-' + 1 },
		mdi(title));
};

var invalidProgressRulesList = function (formSection, level) {
	return ul(
		{ class: 'section-warning-missing-fields-sub-' + level },
		formSection.progressRules.displayable,
		function (rule) {
			if (!rule.message) return;
			return li(_d(rule.message, rule.getTranslations()));
		}
	);
};

var drawFormSection = function (formSection, level) {
	return div(
		{ class: 'section-warning-missing-fields' },
		sectionLabel(formSection, level),
		invalidProgressRulesList(formSection, level)
	);
};

var drawFormSectionGroup = function (groupSection, level) {
	return div(
		{ class: 'section-warning-missing-fields-sub-' + level },
		sectionLabel(groupSection, level),
		invalidProgressRulesList(groupSection, level),
		ul(groupSection.sections, function (subSection) {
			return generateMissingList(subSection, level + 1);
		})
	);
};

var drawFormEntitiesTable = function (tableSection, level) {
	return div(
		level === 0 ? [
			displayableRulesLabel(),
			invalidProgressRulesList(tableSection, level)
		] : [
			sectionLabel(tableSection, level),
			invalidProgressRulesList(tableSection, level + 1)
		],
		ul(tableSection.entitiesSet, function (entity) {
			var entitySections = entity.resolveSKeyPath(tableSection.sectionProperty).value;

			return _if(entitySections._hasDisplayableRuleDeep, li(
				{ class: 'section-warning-missing-fields-sub-' + (level + 1) },
				p(mdi(_("In \"**${ entityTitle }**\" entity:",
					{ entityTitle: entityLabel(tableSection, entity) }))),
				ul(entitySections.applicable, function (entitySection) {
					return generateMissingList(entitySection, level + 1);
				})
			));
		})
	);
};

generateMissingList = function (formSection, level) {
	level = level || 0;

	return _if(formSection._hasDisplayableRuleDeep, function () {
		if (db.FormSection && (formSection instanceof db.FormSection)) {
			return drawFormSection(formSection, level);
		}

		if (db.FormSectionGroup && (formSection instanceof db.FormSectionGroup)) {
			return drawFormSectionGroup(formSection, level);
		}

		if (db.FormEntitiesTable && (formSection instanceof db.FormEntitiesTable)) {
			return drawFormEntitiesTable(formSection, level);
		}
	});

};

module.exports = function (sections) {
	var incompleteSections = sections.filter(function (section) {
		section._hasDisplayableRuleDeep.once('change', function () {
			incompleteSections.refresh(section);
		});
		return section.hasDisplayableRuleDeep;
	});
	return ul(incompleteSections, function (formSection) {
		return section(a({ href: '#' + formSection.domId },
			formSection.onIncompleteMessage || _("${sectionLabel} is invalid",
				{ sectionLabel: formSection.label })),
			generateMissingList(formSection));
	});
};
