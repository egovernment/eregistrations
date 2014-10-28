'use strict';

var $ = require('mano-legacy');

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');

$.formSectionStateHelper = function (formId, entityId, constraints) {
	var Entity = function () {}, form = $(formId),
		domElements = {}, i;

	for (i = 0; i < constraints.length; i++) {
		domElements[constraints[i].id] = $(constraints[i].id);
	}

	$.onEnvUpdate(formId, function () {
		var result, i, formEntity;
		formEntity = new Entity();
		formEntity.__id__ = entityId;
		$.dbjsFormFill(formEntity, form);
		for (i = 0; i < constraints.length; i++) {
			result = constraints[i].constrain.call(formEntity);
			domElements[constraints[i].id].toggle(result);
			if (!result) {
				delete formEntity[constraints[i].id];
			} else {
				$.dbjsFormFill(formEntity, form);
			}
		}
	});
};
