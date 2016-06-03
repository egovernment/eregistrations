'use strict';

var db                = require('../db')
  , _                 = require('mano').i18n
  , FormUpdateSection = require('../model/form-section-update')(db)
  , updatePostfix     = require('../model/form-section-base')(db).updateSectionPostfix
  , camelToHyphen     = require('es5-ext/string/#/camel-to-hyphen')
  , resolventDefinition, setupPropertyMasterType, defineSectionUpdate;

resolventDefinition = {
	label: _("Do you want to amend this section?"),
	type: db.Boolean,
	required: true
};

setupPropertyMasterType = function (section) {
	var UpdateMasterType = section.master.constructor,
		MasterType = db[UpdateMasterType.__id__.replace('Update', '')];

	UpdateMasterType.prototype.previousProcess.resolveSKeyPath(
		[section.__id__.slice(section.__id__.indexOf('/') + 1)]
	).value.setPropertyMasterTypeDeep(MasterType);
};

defineSectionUpdate = function (section, path, nuSectionKey) {
	var resolventName = section.key + 'Resolvent' + updatePostfix, definition = {},
		resolved, resolventOwner;

	resolventOwner = section.master;
	resolved       = resolventOwner.resolveSKeyPath(path);

	if (!resolved) throw new Error("Cannot resolve path ", path);

	definition[resolventName] = resolventDefinition;
	resolventOwner.defineProperties(definition);
	resolved.object.define(nuSectionKey, {
		type: FormUpdateSection,
		nested: true
	});
	resolved.object[nuSectionKey].setProperties({
		shortLabel: section.shortLabel || null,
		resolventProperty: resolventName,
		resolventValue: true
	});
	if (section.pageUrl) {
		resolved.object[nuSectionKey].pageUrl = camelToHyphen.call(section.pageUrl + updatePostfix);
	}
	resolved.object[nuSectionKey].getOwnDescriptor('sourceSection').type = section.constructor;
	setupPropertyMasterType(section);
};

module.exports = function (section) {
	var sectionOwner, path;
	sectionOwner = section.owner;

	if (section instanceof db.FormSectionGroup && section.hasSplitForms) {
		sectionOwner.define(section.key + updatePostfix, {
			type: section.constructor,
			nested: true
		});

		sectionOwner[section.key + updatePostfix].setProperties({
			label: section.label,
			pageUrl: section.pageUrl ? camelToHyphen.call(section.pageUrl + updatePostfix) : null
		});
		section.sections.forEach(function (subSection) {
			var path = sectionOwner[section.key + updatePostfix].__id__ + '/sections/' + subSection.key;
			path = path.slice(path.indexOf('/') + 1);
			defineSectionUpdate(subSection, path, subSection.key);
		});
	} else {
		path = section.__id__.slice(section.__id__.indexOf('/') + 1) + updatePostfix;
		defineSectionUpdate(section, path, section.key + updatePostfix);
	}
};
