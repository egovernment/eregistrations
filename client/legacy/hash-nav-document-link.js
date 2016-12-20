// Handles ordered list of elements which should be toggled with url hash
// Hash indexes are generated automatically

'use strict';

var $       = require('mano-legacy')
  , hashNav = require('mano-legacy/hash-nav')
  , min     = Math.min, max = Math.max

  , DocumentLink;

require('mano-legacy/element#/class');

DocumentLink = function (list, prefix) {
	var i, elem;

	this.list = list.getElementsByTagName('a');

	for (i = 0; i < this.list.length; ++i) {
		elem = this.list[i];

		elem.id = prefix + '-link-' + String(i + 1);
		if ($(elem).hasClass('active')) this.lastItemActive = elem;
	}

	this.prefix = prefix;
};
DocumentLink.prototype.update = function () {
	var index = 1, activeItem;

	if (location.hash.indexOf('#' + this.prefix) === 0) {
		index = min(max(Number(location.hash.slice(this.prefix.length + 2)) || 1, 1), this.list.length);
	}

	activeItem = $(this.prefix + '-link-' + index);
	if (activeItem === this.lastItemActive) return;

	// There can be non activeItem (and in next run no lastItemActive) if user navigated out of
	// non first document page to other url while never visiting before first document page
	if (this.lastItemActive) this.lastItemActive.removeClass('active');
	if (activeItem) activeItem.addClass('active');
	this.lastItemActive = activeItem;
};

module.exports = $.hashNavDocumentLink = function (list, idPrefix) {
	var documentLink = new DocumentLink($(list), idPrefix);
	hashNav.on('update:before', function () { documentLink.update(); });
	documentLink.update();
	return documentLink;
};
