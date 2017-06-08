'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , _            = require('mano').i18n.bind('Statistics certificates csv')
  , modes        = require('../../utils/statistics-flow-group-modes');

module.exports = function (result, config) {
	ensureObject(config);
	var data, mode;
	mode = modes.get(config.mode || 'daily');
	data = [
		[
			mode.labelNoun,
			_("Submitted"),
			_("Pending"),
			_("Ready for withdraw"),
			_("Withdrawn by user"),
			_("Rejected"),
			_("Sent back for correction"),
			_("Approved")
		].join(',')
	];

	Object.keys(result).forEach(function (rowName) {
		var parsedDate = Date.parse(rowName);
		var resultItem = isNaN(parsedDate) ? [rowName] : [mode.getDisplayedKey(new Date(parsedDate))];
		console.log('MY RESULT ITEM', resultItem);
		Array.prototype.push.apply(resultItem,
			Object.keys(result[rowName]).map(function (status) {
				return result[rowName][status];
			}));
		data.push(resultItem.join(','));
	});

	return data.join('\n');
};
