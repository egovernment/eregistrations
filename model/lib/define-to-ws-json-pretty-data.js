'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object');

module.exports = function (object) {
	ensureDbjsObject(object);
	object.define('toWebServiceJSONPrettyData', {
		value: function (data) {
			var keys, result = null, tmpData;
			tmpData = data;
			while (true) {
				keys = Object.keys(tmpData);
				if (keys && keys[0]) {
					if (keys[0] === this.key) {
						result = tmpData[this.key];
						break;
					}
					tmpData = tmpData[keys[0]];
				} else {
					break;
				}
			}
			// didn't manage to prettify, return original
			if (!result) {
				result = data;
			}

			return result;
		}
	});
};
