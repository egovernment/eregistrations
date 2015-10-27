// Draw list of not completed sections and their missing fields.

'use strict';

var db         = require('mano').db
  , _          = require('mano').i18n.bind('Incomplete Sections Navigation')
  , headersMap = require('../utils/headers-map');

var getPropertyLabel = function (section, propertyName) {
	return section.master.resolveSKeyPath(propertyName).ownDescriptor.label;
};

var getEntityTitle = function (section, entity) {
	return entity.resolveSKeyPath(section.entityTitleProperty).observable;
};

var generateSectionLink = function (section) {
	return a(
		{ href: '#' + section.domId },
		section.onIncompleteMessage || _("${sectionLabel} is incomplete",
			{ sectionLabel: section.label })
	);
};

var generateMissingPropertiesList = function (section) {
	return ul(
		{ class: 'section-warning-missing-fields' },
		section.missingRequiredPropertyNames,
		function (propertyName) {
			return getPropertyLabel(section, propertyName);
		}
	);
};

var generateMissingList = function (section, level) {
	level = level || 3;

	if (db.FormSection && (section instanceof db.FormSection)) {
		return div(_("Missing required fields:"), generateMissingPropertiesList(section));
	}

	if (db.FormSectionGroup && (section instanceof db.FormSectionGroup)) {
		return ul(
			section.sections,
			function (subSection) {
				if (!subSection.missingRequiredPropertyNames.size) return;

				return div(_("Missing required fields for the '${sectionLabel}' sub-section:", {
					sectionLabel: subSection.label
				}), generateMissingPropertiesList(subSection));
			}
		);
	}

	if (db.FormEntitiesTable && (section instanceof db.FormEntitiesTable)) {
		return list(section.entitiesSet, function (entity) {
			var entitySections = entity.resolveSKeyPath(section.sectionProperty).value;

			return _if(not(eq(entitySections._progress, 1)), [
				headersMap[level](getEntityTitle(section, entity)),
				list(entitySections.applicable, function (entitySection) {
					return generateMissingList(entitySection, level + 1);
				})
			]);
		});
	}
};

module.exports = function (sections) {
	return ul(sections, function (section) {

		return _if(not(eq(section._status, 1)),
			section(
				generateSectionLink(section),
				generateMissingList(section)
			));
	});
};
