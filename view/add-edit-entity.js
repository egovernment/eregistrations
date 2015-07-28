// Generic entity form user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('User')
  , generateFormSections = require('./components/generate-form-sections')
  , baseUrl = url;

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step  = function () {
	console.log(this.entity);
	var entity = this.entity, url = baseUrl.bind(this.root);

	h1(_if(eqSloppy(entity.getObservable(
		entity.owner.owner.cardinalPropertyKey
	), null),
		_("Add entity"),
		_("Edit entity")));
	insert(generateFormSections(entity.dataForms.applicable,
		{ url: url, isChildEntity: true }));
};
