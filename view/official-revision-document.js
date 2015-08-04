'use strict';

var document = require('./_document');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		console.log(this.document);
		document(this.document.document, require('./_revision-controle')(this.document));
	}
};
