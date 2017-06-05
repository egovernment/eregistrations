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

	Object.keys(result).forEach(function (date) {
		var resultItem = [mode.getDisplayedKey(new Date(date))];
		Array.prototype.push.apply(resultItem,
			Object.keys(result[date]).map(function (status) {
				return result[date][status];
			}));
		data.push(resultItem.join(','));
	});

	return data.join('\n');
};
