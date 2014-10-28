'use strict';

var $ = require('mano-legacy')
  , getContext;

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');

getContext = function (formEntity, constraint) {
	var i, context, arrayFromName;
	context = formEntity;
	if (constraint.sKey.indexOf('/') !== -1) {
		arrayFromName = constraint.sKey.split('/');
		for (i = 0; i < arrayFromName.length - 1; i++) {
			context = context[arrayFromName[i]];
		}
	}
	return context;
};

$.formSectionStateHelper = function (formId, entityId, constraints) {
	var Entity = function () {}, form = $(formId);

	$.onEnvUpdate(formId, function () {
		var result, i, formEntity, context;
		formEntity = new Entity();
		formEntity.__id__ = entityId;
		$.dbjsFormFill(formEntity, form);
		for (i = 0; i < constraints.length; i++) {
			if (!$(constraints[i].id)) {
				continue;
			}
			context = getContext(formEntity, constraints[i]);
			result = constraints[i].constraint.call(context);
			$(constraints[i].id).toggle(result);
			if (!result) {
				delete context[constraints[i].id];
			} else {
				$.dbjsFormFill(formEntity, form);
			}
		}
	});
};
