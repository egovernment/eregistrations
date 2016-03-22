'use strict';

module.exports = function (t, a) {
	a.throws(function () {
		return t(null);
	}, new RegExp('null is not dbjs database'),
		'throws when not given database');
};
