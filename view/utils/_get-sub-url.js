'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

module.exports = function (user, name) {
	return user.__id__ + '/' + camelToHyphen.call(name);
};
