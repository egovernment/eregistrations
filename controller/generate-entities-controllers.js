'use strict';

var object        = require('es5-ext/object/valid-object')
  , callable      = require('es5-ext/object/valid-callable')
  , array         = require('es5-ext/array/valid-array')
  , stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , endsWith      = require('es5-ext/string/#/ends-with')
  , validateType  = require('dbjs/valid-dbjs-type')
  , save          = require('mano/utils/save')
  , validate      = require('mano/utils/validate')
  , db            = require('mano').db
  , forEach       = require('es5-ext/object/for-each')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , toIdString    = require('dom-ext/html-document/to-id-string')

  , call = Function.prototype.call;

var validateExactlyOne = function (object, properties) {
	var foundProperties = [];

	properties.forEach(function (property) {
		if (object[property]) foundProperties.push(property);
	});

	if (foundProperties.length < 1) {
		throw new Error('Missing one of required properties: ' + properties.join(', '),
			'INVALID_INPUT');
	}
	if (foundProperties.length > 1) {
		throw new Error('Cannot set: ' + foundProperties.join(', ') + ' at the same time, choose one!',
			'INVALID_INPUT');
	}

	// A cookie for you:
	// return SUCCESS!!!;
};

module.exports = function (routes, data) {
	(object(routes) && object(data));
	var name = ''
	  , names
	  , type = (data.type && validateType(data.type))
	  , getTargetSet
	  , targetMap
	  , pageUrl
	  , tableHtmlId = stringifiable(data.tableHtmlId)
	  , targetEntityDataFormsMap
	  , result = {};

	var getResolvedPageUrl = function () {
		var pageUrlPart = typeof pageUrl === 'function' ? call.call(pageUrl, this) : pageUrl;
		return pageUrlPart + '#' + tableHtmlId;
	};

	validateExactlyOne(data, ['name', 'names']);
	validateExactlyOne(data, ['getTargetSet', 'targetMap']);

	if (data.name) {
		name = stringifiable(data.name);
	} else {
		names = array(data.names);
		names.forEach(function (nameElement, nameIndex) {
			if (nameIndex === names.length - 1) {
				name += nameElement;
			} else {
				name += nameElement + '/[a-z0-9]+/';
			}
		});
	}

	if (data.getTargetSet) {
		getTargetSet = callable(data.getTargetSet);
	} else {
		targetMap = callable(data.targetMap);
	}

	if (typeof data.pageUrl === 'function') {
		pageUrl = data.pageUrl;
	} else {
		pageUrl = stringifiable(data.pageUrl);
	}

	if (data.targetEntityPrototype) {
		targetEntityDataFormsMap = data.targetEntityPrototype.dataForms.map;
	}

	var commonMatcher = function (/* matchedIds */) {
		var matchedIds = arguments, target, targetSet, id = matchedIds[matchedIds.length - 1];
		// when we have NestedMap, create new entry or get existing
		if (targetMap) {
			this.matchedIds = matchedIds;
			this.target = call.call(targetMap, this).map.get(id);
			return true;
		}
		targetSet = call.call(getTargetSet, this);
		if (type) {
			target = type.getById(id);
		} else {
			target = targetSet.object._getDescriptor_(targetSet.__pSKey__).type.getById(id);
		}
		if (!target) return false;
		if (!targetSet.has(target)) return false;
		this.target = target;
		return true;
	};

	var commonValidator = function (data) {
		var cardinalPropertyKey;
		if (targetMap) {
			cardinalPropertyKey = call.call(targetMap, this).cardinalPropertyKey;
			forEach(data, function (field, key) {
				if (endsWith.call(key, '/' + cardinalPropertyKey) && !field) {
					throw new Error('Missing required property: ' + cardinalPropertyKey,
						'INVALID_INPUT');
				}
			});
		}
		return validate(data);
	};

	routes[name + '-resolvent'] = result.resolvent = {
		match: names ? commonMatcher : undefined,
		redirectUrl: getResolvedPageUrl
	};
	routes[name + '-add'] = result.add = {
		match: names ? commonMatcher : undefined,
		submit: function () {
			save.apply(this, arguments);
			call.call(getTargetSet, this).add(this.target);
		},
		redirectUrl: getResolvedPageUrl
	};
	routes[name + '/[a-z0-9]+/delete'] = result.delete = {
		match: commonMatcher,
		submit: function () {
			if (targetMap) {
				this.target._destroy_();
				return;
			}
			db.objects.delete(this.target);
		},
		formHtmlId: tableHtmlId
	};

	if (targetEntityDataFormsMap && targetEntityDataFormsMap.size > 1) {
		targetEntityDataFormsMap.forEach(function (dataForm) {
			if (db.FormEntitiesTable.is(dataForm)) return;

			routes[name + '/[a-z0-9]+/' + camelToHyphen.call(dataForm.key)] = {
				validate: commonValidator,
				match: commonMatcher,
				formHtmlId: toIdString(dataForm.label)
			};
		});
	} else {
		routes[name + '/[a-z0-9]+'] = result.edit = {
			validate: commonValidator,
			match: commonMatcher,
			redirectUrl: getResolvedPageUrl
		};
	}

	return result;
};
