'use strict';

var $ = require('mano-legacy')
  , getContext;

require('mano-legacy/on-env-update');
require('mano-legacy/dbjs-form-fill');
require('mano-legacy/element#/toggle');

getContext = function (formEntity, sKeyPath) {
	var i, context, arrayFromName, sKey;
	context = formEntity;
	sKey = sKeyPath;
	if (sKeyPath.indexOf('/') !== -1) {
		arrayFromName = sKeyPath.split('/');
		sKey = arrayFromName[arrayFromName.length - 1];
		for (i = 0; i < arrayFromName.length - 1; i++) {
			context = context[arrayFromName[i]];
		}
	}
	return { sKey: sKey, object: context };
};

$.formSectionStateHelper = function (formId, entityId, constraints/*, options */) {
	var Entity = function () {}, form = $(formId), formEntity, options;
	options = Object(arguments[3]);
	if (options && options.legacyEntityProto) {
		Entity.prototype = options.legacyEntityProto;
	}
	formEntity = new Entity();
	formEntity.__id__ = entityId;
	$.onEnvUpdate(formId, function () {
		var result, i, context, domElem;
		$.dbjsFormFill(formEntity, form);
		for (i = 0; i < constraints.length; i++) {
			domElem = $(constraints[i].id);
			if (!domElem) {
				continue;
			}
			context = getContext(formEntity, constraints[i].sKeyPath);
			result = constraints[i].constraint.call(context.object);
			domElem.toggle(result);
			if (!result) {
				delete context.object[context.sKey];
			} else {
				$.dbjsFormFill(formEntity, form);
			}
		}
	});
};
