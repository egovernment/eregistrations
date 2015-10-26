// Draw list of not completed sections and their missing fields.

'use strict';

var db = require('mano').db
  , ns = require('mano').domjs.ns
  , _  = require('mano').i18n.bind('Incomplete Sections Navigation')
  , headersMap = require('../utils/headers-map');

var getPropertyLabel = function (section, propertyName) {
	return section.master.resolveSKeyPath(propertyName).ownDescriptor.label;
};

var getEntityTitle = function (section, entity) {
	return entity.resolveSKeyPath(section.entityTitleProperty).observable;
};

var generateSectionLink = function (section) {
	return ns.a(
		{ href: '#' + section.domId },
		section.onIncompleteMessage || _("${sectionLabel} is incomplete",
			{ sectionLabel: section.label })
	);
};

var generateMissingPropertiesList = function (section) {
	return ns.ul(
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
		return ns.div(_("Missing required fields:"), generateMissingPropertiesList(section));
	}

	if (db.FormSectionGroup && (section instanceof db.FormSectionGroup)) {
		return ns.ul(
			section.sections,
			function (subSection) {
				if (!subSection.missingRequiredPropertyNames.size) return;

				return ns.div(_("Missing required fields for the '${sectionLabel}' sub-section:", {
					sectionLabel: subSection.label
				}), generateMissingPropertiesList(subSection));
			}
		);
	}

	if (db.FormEntitiesTable && (section instanceof db.FormEntitiesTable)) {
		return ns.list(section.entitiesSet, function (entity) {
			var entitySections = entity.resolveSKeyPath(section.sectionProperty).value;

			return ns._if(ns.not(ns.eq(entitySections._progress, 1)), [
				headersMap[level](getEntityTitle(section, entity)),
				ns.list(entitySections.applicable, function (entitySection) {
					return generateMissingList(entitySection, level + 1);
				})
			]);
		});
	}
};

module.exports = function (sections) {
	return ns.ul(sections, function (section) {

		return ns._if(ns.not(ns.eq(section._status, 1)),
			ns.section(
				generateSectionLink(section),
				generateMissingList(section)
			));
	});
};
