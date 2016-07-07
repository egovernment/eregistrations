'use strict';

var camelToHyphen     = require('es5-ext/string/#/camel-to-hyphen')
  , setupPropertyMasterType, defineSectionUpdate;

var setPropertyMasterTypeDeep = function (section, MasterType) {
	var db = section.database;
	if (db.FormSectionGroup && section instanceof db.FormSectionGroup) {
		section.sections.forEach(function (subSection) {
			setPropertyMasterTypeDeep(subSection, MasterType);
		});
		return;
	}
	section.propertyMasterType = MasterType;
};

setupPropertyMasterType = function (section) {
	var UpdateMasterType = section.master.constructor,
		db = section.database, MasterType = db[UpdateMasterType.__id__.replace('Update', '')];

	setPropertyMasterTypeDeep(UpdateMasterType.prototype.previousProcess.resolveSKeyPath(
		[section.__id__.slice(section.__id__.indexOf('/') + 1)]
	).value, MasterType);
};

defineSectionUpdate = function (section, path, nuSectionKey) {
	var resolved, db, FormSectionUpdate, updatePostfix;
	resolved          = section.master.resolveSKeyPath(path);
	db                = section.database;
	FormSectionUpdate = require('../model/form-section-update')(db);
	updatePostfix     = FormSectionUpdate.updateSectionPostfix;

	if (!resolved) throw new Error("Cannot resolve path ", path);

	resolved.object.define(nuSectionKey, {
		type: FormSectionUpdate,
		nested: true
	});
	resolved.object[nuSectionKey].setProperties({
		shortLabel: section.shortLabel || null
	});
	if (section.pageUrl) {
		resolved.object[nuSectionKey].pageUrl = camelToHyphen.call(section.pageUrl + updatePostfix);
	}
	resolved.object[nuSectionKey].getOwnDescriptor('sourceSection').type = section.constructor;
	setupPropertyMasterType(section);
};

module.exports = function (section) {
	var sectionOwner, path, db, updatePostfix, FormSectionUpdate;
	db                = section.database;
	FormSectionUpdate = require('../model/form-section-update')(db);
	sectionOwner      = section.owner;
	updatePostfix     = FormSectionUpdate.updateSectionPostfix;

	if (db.FormSectionGroup && section instanceof db.FormSectionGroup && section.hasSplitForms) {
		sectionOwner.define(section.key + updatePostfix, {
			type: section.constructor,
			nested: true
		});

		sectionOwner[section.key + updatePostfix].setProperties({
			label: section.label || '',
			hasSplitForms: section.hasSplitForms,
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
