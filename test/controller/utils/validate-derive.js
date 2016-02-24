'use strict';

var BusinessProcess = require('../../../model/business-process-new')(require('mano').db);

module.exports = function (t, a) {
	var bp = new BusinessProcess(), context = Object.create(null), data = {};

	a.throws(function () { t.call(context, data); },
		new RegExp('Wrong post data'),
		'throws when no initialData');

	data.initialProcess = bp.__id__;

	a.throws(function () { t.call(context, data); },
		new RegExp('This business process cannot be a derivation source'),
		'throws when unable to derivate');

	bp.isApproved = true;
	a(context.derivationSource, undefined);
	a(t.call(context, data), true);
	a(context.derivationSource, bp);
	data.initialProcess = 'notRegistered';
	a(t.call(context, data), true);
	a(context.derivationSource, null);
};
