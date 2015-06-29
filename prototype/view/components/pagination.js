'use strict';

var assign          = require('es5-ext/object/assign')
  , copy            = require('es5-ext/object/copy')
  , value           = require('es5-ext/object/valid-value')
  , ee              = require('event-emitter')
  , d               = require('d')
  , autoBind        = require('d/auto-bind')
  , memoizeMethods  = require('memoizee/methods-plain')
  , ObservableValue = require('observable-value')
  , replaceContent  = require('dom-ext/element/#/replace-content')
  , formatUrl       = require('url3/format')
  , parseUrl        = require('url3/parse')
  , ns              = require('mano').domjs.ns
  , location        = require('mano/lib/client/location');

var PaginationDom = function (pagination) {
	this.pagination = pagination;
	this.list = ns.ul({ class: 'pagination' });
	this.dom = ns._if(this.pagination.count.gt(1), this.list).toDOM(document);
	this.reload();
	this.pagination.count.on('change', this.reload);
};
Object.defineProperties(PaginationDom.prototype, assign({
	toDOM: d(function (document) { return this.dom; })
}, autoBind({
	reload: d(function () {
		var i, l = this.pagination.count.value, buttons = [];
		if (l < 2) return;
		for (i = 1; i <= l; ++i) buttons.push(this.getPageButton(i));
		replaceContent.call(this.list, buttons);
	})
}), memoizeMethods({
	getPageButton: d(function (page) {
		return ns.li({ class: ns._if(this.pagination.current.eq(page), 'pagination-active') },
			ns.a({ href: ns._if(this.pagination.current.eq(page), null, this.pagination.getLink(page)) },
				page));
	})
})));

var Pagination = module.exports = function (pathname, count, current) {
	if (!(this instanceof Pagination)) return new Pagination(pathname, count, current);
	this.pathname = String(value(pathname));
	this.url = parseUrl(this.pathname, true);
	delete this.url.search;
	this.url.query = copy(location.query);
	location.on('change', this.updateLinks);
	this.count = new ObservableValue(count);
	this.count.on('change', this.updateLinks);
	this.current = new ObservableValue(count);
};

ee(Object.defineProperties(Pagination.prototype, assign({
	toDOM: d(function (document) { return (new PaginationDom(this)).toDOM(document); })
}, autoBind({
	updateLinks: d(function () {
		if (this.pathname !== location.pathname) return;
		this.url.query = copy(location.query);
		var i, l = this.count.value;
		for (i = 1; i <= l; ++i) {
			if (i === 1) delete this.url.query.page;
			else this.url.query.page = i;
			this.getLink(i).value = formatUrl(this.url);
		}
	})
}), memoizeMethods({
	getLink: d(function (page) {
		if (page === 1) delete this.url.query.page;
		else this.url.query.page = page;
		return new ObservableValue(formatUrl(this.url));
	})
}))));
