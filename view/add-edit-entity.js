// Generic entity form user page (Part A)

'use strict';

var _  = require('mano').i18n.bind('User')
  , generateFormSections = require('./components/generate-form-sections')
  , baseUrl = url;

exports._parent = require('./user-registration-base');

exports['step-guide'] = { class: { 'step-form': true } };

exports.step  = function () {
	var entity = this.entity, url = baseUrl.bind(this.root);

	h1(_if(eqSloppy(entity.getObservable(
		entity.owner.owner.cardinalPropertyKey
	), null),
		_("Add ${ entityLabel }", { entityLabel: this.entity.constructor.label }),
		_("Edit ${ entityName }", { entityName: this.entity._name })));
	insert(generateFormSections(entity.dataForms.applicable,
		{ url: url }));
	insert(_if(gt(this.entity.dataForms.map.size, 1),
		div({ class: 'user-next-step-button' },
			a({ href: exports._entitiesTableUrl(this) }, _("Back to form")))));
};

exports._entitiesTableUrl = Function.prototype;
