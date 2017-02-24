'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , modes        = require('../../utils/statistics-flow-group-modes')
  , _            = require('mano').i18n.bind('Statistics operators csv');

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

	Object.keys(result).forEach(function (date) {
		Object.keys(result[date]).forEach(function (processorId) {
			var resultItem = [];
			resultItem.push(date);
			resultItem.push(processorId);
			Object.keys(result[date][processorId]).forEach(function (prop) {
				resultItem.push(result[date][processorId][prop]);
			});
			data.push(resultItem.join(','));
		});
	});

	return data.join('\n');
};
