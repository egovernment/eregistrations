'use strict';

var ensureObject            = require('es5-ext/object/valid-object')
  , modes                   = require('../../utils/statistics-flow-group-modes')
  , _                       = require('mano').i18n.bind('Statistics roles csv')
  , processingSteps         = require('../../processing-steps-meta')
  , getStepLabelByShortPath = require('../../utils/get-step-label-by-short-path');

module.exports = function (result, config) {
	ensureObject(config);
	var data, mode;
	mode = modes.get(config.mode || 'daily');
	data = [
		[mode.labelNoun].concat(
			Object.keys(processingSteps).map(function (shortStepPath) {
				return getStepLabelByShortPath(shortStepPath);
			})
		).join(',')
	];

	Object.keys(result).forEach(function (rowName) {
		var parsedDate = Date.parse(rowName);
		var resultItem = isNaN(parsedDate) ? [rowName] : [mode.getDisplayedKey(new Date(parsedDate))];
		Array.prototype.push.apply(resultItem,
			Object.keys(result[rowName]).map(function (step) {
				return (result[rowName][step] == null ? _("N/A") : result[rowName][step]);
			}));
		data.push(resultItem.join(','));
	});

	return data.join('\n');
};
