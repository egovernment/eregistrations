// Generic entity form user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('User')
  , generateFormSections = require('./components/generate-form-sections')
  , toIdString = require('dom-ext/html-document/to-id-string')
  , baseUrl = url;

exports._parent = require('./business-process-base');
exports._match = 'entity';

exports['step-guide'] = { class: { 'step-form': true } };

exports.step  = function () {
	var entity = this.entity, url = baseUrl.bind(this.root)
	  , entitiesNestedMap = entity.owner.owner, entitiesTableId;

	entitiesNestedMap.owner.dataForms.map.some(function (section) {
		if (section.propertyName === entitiesNestedMap.key) {
			entitiesTableId = toIdString(section.label);
			return true;
		}
	});

	h1(_if(eqSloppy(entity.getObservable(
		entity.owner.owner.cardinalPropertyKey
	), null),
		_("Add ${ entityLabel }", { entityLabel: this.entity.label }),
		_("Edit ${ entityName }", { entityName: this.entity._name })));
	insert(generateFormSections(entity.dataForms.applicable,
		{ url: url }));
	if (this.entity.dataForms.map.size > 1) {
		div({ class: 'user-next-step-button' },
			a({ href: exports._entitiesTableRootUrl(this) + '#' + entitiesTableId },
				_("Back to form")));
	}
};

exports._entitiesTableRootUrl = Function.prototype;
