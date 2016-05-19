'use strict';

module.exports = function self(section, cumulatedResult) {
	var db = section.database;

	if (db.FormSectionGroup && section instanceof db.FormSectionGroup) {
		section.sections.forEach(function (childSection) {
			self(childSection, cumulatedResult);
		});
		return;
	}
	//We ignore entities
	if (db.FormEntitiesTable && section instanceof db.FormEntitiesTable) {
		return;
	}

	Array.prototype.push.apply(cumulatedResult, section.propertyNames.toArray());
};
