'use strict';

var document = require('./_payment');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		document(this.payment.document, require('./_revision-payment-controle')(this.payment));
	}
};
