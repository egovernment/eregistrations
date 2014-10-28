'use strict';

var $ = require('mano-legacy')
  , getContext;

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');

getContext = function (formEntity, constrain) {
	var i, context, arrayFromName;
	context = formEntity;
	if (constrain.sKey.indexOf('/') !== -1) {
		arrayFromName = constrain.sKey.split('/');
		for (i = 0; i < arrayFromName.length - 1; i++) {
			context = context[arrayFromName[i]];
		}
	}
	return context;
};

$.formSectionStateHelper = function (formId, entityId, constraints) {
	var Entity = function () {}, form = $(formId);

	$.onEnvUpdate(formId, function () {
		var result, i, formEntity, domElements, context;
		formEntity = new Entity();
		formEntity.__id__ = entityId;
		$.dbjsFormFill(formEntity, form);
		domElements = {};
		for (i = 0; i < constraints.length; i++) {
			domElements[constraints[i].id] = $(constraints[i].id);
			if (!domElements[constraints[i].id]) {
				continue;
			}
			context = getContext(formEntity, constraints[i]);
			result = constraints[i].constrain.call(context);
			domElements[constraints[i].id].toggle(result);
			if (!result) {
				delete formEntity[constraints[i].id];
			} else {
				$.dbjsFormFill(formEntity, form);
			}
		}
	});
};
