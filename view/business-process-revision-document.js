'use strict';

var document = require('./_document'),
revisionControle = require('./_revision-controle');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		document(this.document.document, revisionControle(this.document));
	}
};
