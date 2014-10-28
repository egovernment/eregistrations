'use strict';

var $ = require('mano-legacy')
  , getContext;

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');

getContext = function (formEntity, sKeyPath) {
	var i, context, arrayFromName;
	context = formEntity;
	if (sKeyPath.indexOf('/') !== -1) {
		arrayFromName = sKeyPath.split('/');
		for (i = 0; i < arrayFromName.length - 1; i++) {
			context = context[arrayFromName[i]];
		}
	}
	return { sKey: arrayFromName[arrayFromName.length - 1], object: context };
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
			context = getContext(formEntity, constraints[i].sKeyPath);
			result = constraints[i].constraint.call(context.object);
			$(constraints[i].id).toggle(result);
			if (!result) {
				delete context.object[context.sKey];
			} else {
				$.dbjsFormFill(formEntity, form);
			}
		}
	});
};
