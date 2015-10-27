// Draw list of not completed sections and their missing fields.

'use strict';

var db         = require('mano').db
  , _          = require('mano').i18n.bind('Incomplete Sections Navigation')
  , headersMap = require('../utils/headers-map');

var getPropertyLabel = function (formSection, propertyName) {
	return JSON.stringify(formSection.master.resolveSKeyPath(propertyName).ownDescriptor.label);
};

var getEntityTitle = function (formSection, entity) {
	return entity.resolveSKeyPath(formSection.entityTitleProperty).observable;
};

var generateSectionLink = function (formSection) {
	return a(
		{ href: '#' + formSection.domId },
		formSection.onIncompleteMessage || _("${sectionLabel} is incomplete",
			{ sectionLabel: formSection.label })
	);
};

var generateMissingPropertiesList = function (formSection) {
	return ul(
		formSection.missingRequiredPropertyNames,
		function (propertyName) {
			return getPropertyLabel(formSection, propertyName);
		}
	);
};

var generateMissingList = function (formSection, level) {
	level = level || 3;

	if (db.FormSection && (formSection instanceof db.FormSection)) {
		return div({ class: 'section-warning-missing-fields' },
			p(_("Missing required fields:")), generateMissingPropertiesList(formSection));
	}

	if (db.FormFormSectionGroup && (formSection instanceof db.FormSectionGroup)) {
		return ul(
			formSection.sections,
			function (subSection) {
				if (!subSection.missingRequiredPropertyNames.size) return;

				return div({ class: 'section-warning-missing-fields' },
					p(_("Missing required fields for the '${sectionLabel}' sub-section:", {
						sectionLabel: subSection.label
					})), generateMissingPropertiesList(subSection));
			}
		);
	}

	if (db.FormEntitiesTable && (formSection instanceof db.FormEntitiesTable)) {
		return list(formSection.entitiesSet, function (entity) {
			var entitySections = entity.resolveSKeyPath(formSection.sectionProperty).value;

			return _if(not(eq(entitySections._progress, 1)), [
				headersMap[level](getEntityTitle(formSection, entity)),
				list(entitySections.applicable, function (entitySection) {
					return generateMissingList(entitySection, level + 1);
				})
			]);
		});
	}
};

module.exports = function (sections) {
	return ul(sections, function (formSection) {

		return _if(not(eq(formSection._status, 1)),
			section(
				generateSectionLink(formSection),
				generateMissingList(formSection)
			));
	});
};
