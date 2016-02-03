// Draw list of not completed sections and their missing fields.

'use strict';

var db               = require('mano').db
  , _                = require('mano').i18n.bind('Incomplete Sections Navigation')
  , getPropertyLabel = require('../utils/get-property-label')

  , _d = _
  , generateMissingList;

var propertyLabel = function (formSection, propertyName) {
	return JSON.stringify(getPropertyLabel(formSection.master.resolveSKeyPath(propertyName)));
};

var entityLabel = function (tableSection, entity) {
	return entity.resolveSKeyPath(tableSection.entityTitleProperty).observable;
};

var missingFieldsLabel = function () {
	return p(_("Missing required fields:"));
};

var sectionLabel = function (formSection, level) {
	if (level === 0) return missingFieldsLabel();

	return p({ class: 'section-warning-missing-fields-sub-' + 1 },
		mdi(_("In _\"${ sectionLabel }\"_ section:", { sectionLabel: formSection.label })));
};

var missingPropertiesList = function (formSection) {
	return ul(
		{ class: 'section-warning-missing-fields-list' },
		formSection.missingRequiredPropertyNames,
		function (propertyName) {
			return propertyLabel(formSection, propertyName);
		}
	);
};

var invalidProgressRulesList = function (formSection, level) {
	var translationInserts = { max: formSection._max, min: formSection._min };

	return ul(
		{ class: 'section-warning-missing-fields-sub-' + level },
		formSection.progressRules.invalid,
		function (progressRule) {
			return li(_d(progressRule.message, translationInserts));
		}
	);
};

var drawFormSection = function (formSection, level) {
	return div(
		{ class: 'section-warning-missing-fields' },
		sectionLabel(formSection, level),
		missingPropertiesList(formSection)
	);
};

var drawFormSectionGroup = function (groupSection, level) {
	return div(
		{ class: 'section-warning-missing-fields-sub-' + level },
		sectionLabel(groupSection, level),
		ul(groupSection.sections, function (subSection) {
			return generateMissingList(subSection, level + 1);
		})
	);
};

var drawFormEntitiesTable = function (tableSection, level) {
	return div(
		level === 0 ? [
			invalidProgressRulesList(tableSection, level),
			_if(lt(tableSection.progressRules.map.entities._progress, 1), missingFieldsLabel())
		] : [
			sectionLabel(tableSection, level),
			invalidProgressRulesList(tableSection, level + 1)
		],
		ul(tableSection.entitiesSet, function (entity) {
			var entitySections = entity.resolveSKeyPath(tableSection.sectionProperty).value;

			return _if(lt(entitySections._progress, 1), li(
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

	return _if(formSection._hasMissingRequiredPropertyNamesDeep, function () {
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
	return ul(sections, function (formSection) {

		return _if(formSection._hasMissingRequiredPropertyNamesDeep,
			section(
				a(
					{ href: '#' + formSection.domId },
					formSection.onIncompleteMessage || _("${sectionLabel} is incomplete",
						{ sectionLabel: formSection.label })
				),
				generateMissingList(formSection)
			));
	});
};
