'use strict';

var object        = require('es5-ext/object/valid-object')
  , callable      = require('es5-ext/object/valid-callable')
  , stringifiable = require('es5-ext/object/validate-stringifiable-value')
  , validateType  = require('dbjs/valid-dbjs-type')
  , save          = require('mano/utils/save')
  , db            = require('mano').db

  , call = Function.prototype.call;

module.exports = function (routes, data) {
	(object(routes) && object(data));
	var name = stringifiable(data.name)
	  , type = (data.type && validateType(data.type))
	  , getTargetSet = callable(data.getTargetSet)
	  , pageUrl = stringifiable(data.pageUrl)
	  , tableHtmlId = stringifiable(data.tableHtmlId)
	  , match;

	routes[name + '-add'] = {
		save: function () {
			save.apply(this, arguments);
			call.call(getTargetSet, this).add(this.target);
		},
		redirectUrl: pageUrl + '#' + tableHtmlId
	};
	routes[name + '/[0-9][a-z0-9]+'] = {
		match: match = function (id) {
			var target, targetSet;
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
		},
		redirectUrl: pageUrl + '#' + tableHtmlId
	};
	routes[name + '/[0-9][a-z0-9]+/delete'] = {
		match: match,
		save: function () { db.objects.delete(this.target); },
		formHtmlId: '#' + tableHtmlId
	};
};
