'use strict';

var BusinessProcess = require('../../../model/business-process-new')(require('mano').db);

module.exports = function (t, a) {
	var bp = new BusinessProcess(), data = {};

	a.throws(function () { t(data); },
		new RegExp('Wrong post data'),
		'throws when no initialData');

	data.initialProcess = bp.__id__;

	a.throws(function () { t(data); },
		new RegExp('This business process cannot be a derivation source'),
		'throws when unable to derivate');

	bp.isApproved = true;
	a(t(data), bp);
	data.initialProcess = 'notRegistered';
	a(t(data), null);
};
