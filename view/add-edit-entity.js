// Generic entity form user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('User')
  , generateFormSections = require('./components/generate-form-sections')
  , baseUrl = url;

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step  = function () {
	var entity = this.entity, url = baseUrl.bind(this.root);

	console.log(entity.name);

	h1(_if(eqSloppy(entity.getObservable(
		entity.owner.owner.cardinalPropertyKey
	), null),
		_("Add ${ entityLabel }", { entityLabel: this.entity.constructor.label }),
		_("Edit ${ entityName }", { entityName: this.entity.name })));
	insert(generateFormSections(entity.dataForms.applicable,
		{ url: url, isChildEntity: true }));
};
