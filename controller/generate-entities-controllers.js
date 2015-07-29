'use strict';

var object        = require('es5-ext/object/valid-object')
  , callable      = require('es5-ext/object/valid-callable')
  , stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , validateType  = require('dbjs/valid-dbjs-type')
  , save          = require('mano/utils/save')
  , validate      = require('mano/utils/validate')
  , db            = require('mano').db
  , forEach       = require('es5-ext/object/for-each')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')

  , call = Function.prototype.call;

module.exports = function (routes, data) {
	(object(routes) && object(data));
	var name = stringifiable(data.name)
	  , type = (data.type && validateType(data.type))
	  , getTargetSet
	  , targetMap
	  , pageUrl = stringifiable(data.pageUrl)
	  , tableHtmlId = stringifiable(data.tableHtmlId)
	  , targetEntityDataFormsMap
	  , result = {};

	if (data.getTargetSet && data.targetMap) {
		throw new Error('Cannot set both: getTargetSet and getTargetMap, choose one!',
			'INVALID_OPTIONS');
	}
	if (data.getTargetSet) {
		getTargetSet = callable(data.getTargetSet);
	} else {
		targetMap = callable(data.targetMap);
	}
	if (data.targetEntityPrototype) {
		targetEntityDataFormsMap = data.targetEntityPrototype.dataForms.map;
	}

	var commonMatcher = function (id) {
		var target, targetSet;
		// when we have NestedMap, create new entry or get existing
		if (targetMap) {
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
				if (key.endsWith(cardinalPropertyKey) && (field == null)) {
					throw new Error('Missing required property: ' + cardinalPropertyKey,
						'INVALID_INPUT');
				}
			});
		}
		return validate(data);
	};

	routes[name + '-resolvent'] = result.resolvent = {
		redirectUrl: pageUrl + '#' + tableHtmlId
	};
	routes[name + '-add'] = result.add = {
		submit: function () {
			save.apply(this, arguments);
			call.call(getTargetSet, this).add(this.target);
		},
		redirectUrl: pageUrl + '#' + tableHtmlId
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
		formHtmlId: '#' + tableHtmlId
	};

	if (targetEntityDataFormsMap && targetEntityDataFormsMap.size > 1) {
		targetEntityDataFormsMap.forEach(function (dataForm) {
			var dataFormHtmlId = camelToHyphen.call(dataForm.key);
			routes[name + '/[a-z0-9]+/' + dataFormHtmlId] = {
				validate: commonValidator,
				match: commonMatcher,
				formHtmlId: '#' + dataFormHtmlId
			};
		});
	} else {
		routes[name + '/[a-z0-9]+'] = result.edit = {
			validate: commonValidator,
			match: commonMatcher,
			redirectUrl: pageUrl + '#' + tableHtmlId
		};
	}

	return result;
};
