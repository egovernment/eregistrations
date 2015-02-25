'use strict';

var $ = require('mano-legacy')
  , getContext;

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');
require('mano-legacy/dbjs-observe-mock');

getContext = function (formEntity, sKeyPath) {
	var i, context, arrayFromName, sKey;
	context = formEntity;
	sKey = sKeyPath;
	if (sKeyPath.indexOf('/') !== -1) {
		arrayFromName = sKeyPath.split('/');
		sKey = arrayFromName[arrayFromName.length - 1];
		for (i = 0; i < arrayFromName.length - 1; i++) {
			context = context[arrayFromName[i]] || { master: formEntity.master,
				key: arrayFromName[i], owner: context || formEntity.master };
		}
	}
	return { sKey: sKey, object: context };
};

$.formSectionStateHelper = function (formId, entityId, constraints, legacyEntityProto) {
	var Entity = function () {}, form = $(formId);
	if (legacyEntityProto) {
		Entity.prototype = legacyEntityProto;
	}
	$.onEnvUpdate(formId, function () {
		var result, i, context, domElem, entities = {}, formEntityId, formEntity;
		for (i = 0; i < constraints.length; i++) {
			domElem = $(constraints[i].id);
			if (!domElem) {
				continue;
			}
			formEntityId = constraints[i].sKey.split('/', 1)[0];
			formEntity = entities[formEntityId];
			if (!formEntity) {
				formEntity = entities[formEntityId] = new Entity();
				formEntity.__id__ = formEntityId;
				$.dbjsFormFill(formEntity, form, $.formSectionsObjectsMap);
			}
			context = getContext(formEntity, constraints[i].sKey.slice(formEntityId.length + 1));
			result = constraints[i].constraint.call(context.object, $.dbjsObserveMock);
			domElem.toggle(result);
			if (!result) {
				delete context.object[context.sKey];
			} else {
				$.dbjsFormFill(formEntity, form, $.formSectionsObjectsMap);
			}
		}
	});
};
