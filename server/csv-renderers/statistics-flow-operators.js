'use strict';

var ensureObject     = require('es5-ext/object/valid-object')
  , deferred         = require('deferred')
  , modes            = require('../../utils/statistics-flow-group-modes')
  , _                = require('mano').i18n.bind('Statistics operators csv')
  , usersFullNameMap = require('../lib/user-full-names-map');

module.exports = function (result, config) {
	ensureObject(config);
	var data, mode;
	mode = modes.get(config.mode || 'daily');
	data = [
		[
			mode.labelNoun,
			_("Operator"),
			_("Files Processed"),
			_("Approved"),
			_("Sent Back for corrections"),
			_("Rejected")
		].join(',')
	];

	return deferred.map(Object.keys(result), function (date) {
		return deferred.map(Object.keys(result[date]), function (processorId) {
			return usersFullNameMap.get(processorId)(function (fullName) {
				var resultItem = [];
				resultItem.push(date);
				resultItem.push(fullName ? fullName.slice(1) : _("Unknown user"));
				Object.keys(result[date][processorId]).forEach(function (prop) {
					resultItem.push(result[date][processorId][prop]);
				});
				data.push(resultItem.join(','));
			});
		});
	})(function () {
		return data.join('\n');
	});
};
