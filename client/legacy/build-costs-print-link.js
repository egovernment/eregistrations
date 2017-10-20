'use strict';

var $ = require('mano-legacy');

module.exports = $.buildCostsPrintLink = function (currentLink, cost, field, prefix) {
	if (!prefix) prefix = '';
	currentLink.search += (currentLink.search.length) ?
			'&' + prefix + cost.key + '=' + cost[field].toFixed(2) :
			'?' + prefix + cost.key + '=' + cost[field].toFixed(2);

	return currentLink;
};
