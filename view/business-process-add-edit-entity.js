// Generic entity form user page (Part A)

'use strict';

var db                   = require('mano').db
  , _                    = require('mano').i18n.bind('View: Business Process')
  , generateFormSections = require('./components/generate-form-sections')
  , baseUrl              = url;

exports._parent = require('./business-process-base');
exports._match = 'entity';

var findEntitiesTableId = function (sections, entitiesKey) {
	var entitiesTableId;

	sections.some(function (section) {
		if (section.propertyName === entitiesKey) {
			entitiesTableId = section.domId;
			return true;
		}

		if (db.FormSectionGroup && (section instanceof db.FormSectionGroup)) {
			entitiesTableId = findEntitiesTableId(section.sections, entitiesKey);
			return entitiesTableId;
		}
	});

	return entitiesTableId;
};

exports.step  = function () {
	var entity            = this.entity
	  , url               = baseUrl.bind(this.root)
	  , entitiesNestedMap = entity.owner.owner
	  , entitiesTableId;

	entitiesTableId = findEntitiesTableId(entitiesNestedMap.owner.dataForms.map,
		entitiesNestedMap.key);

	h1(_if(eqSloppy(entity.getObservable(
		entity.owner.owner.cardinalPropertyKey
	), null),
		exports._addHeaderText.call(this),
		_("Edit ${ entityName }", { entityName: entity._name })));
	insert(generateFormSections(entity.dataForms.applicable,
		{ viewContext: this, url: url }));
	if (entity.dataForms.map.size > 1) {
		div({ class: 'user-next-step-button' },
			a({ href: (this.entitiesTableRootUrl || '/forms/') + '#' + entitiesTableId },
				_("Back to form")));
	}
};

exports._addHeaderText = function () {
	return _("Add ${ entityLabel }", { entityLabel: this.entity.label });
};
