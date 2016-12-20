'use strict';

require('../../model/business-process-new/base')(require('../../db'));

module.exports = function (t, a) {
	a(typeof t.size, 'number');
};
