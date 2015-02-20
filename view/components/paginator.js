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

var PaginatorDom = function (paginator) {
	this.paginator = paginator;
	this.list = ns.ul({ class: 'paginator' });
	this.dom = ns._if(ns.gt(this.paginator.count, 0), this.dom).toDOM(document);
	this.reload();
	this.paginator.count.on('change', this.reload);
};
Object.defineProperties(PaginatorDom.prototype, assign({
	toDOM: d(function (document) { return this.dom; })
}, autoBind({
	reload: d(function () {
		var i, l = this.paginator.count.value, buttons = [];
		if (l < 2) return;
		for (i = 1; i <= l; ++i) buttons.push(this.getPageButton(i));
		replaceContent.call(this.list, buttons);
	})
}), memoizeMethods({
	getPageButton: d(function (page) {
		return ns.a({ href: this.paginator.getLink(page),
			class: ns._if(this.paginator.current.eq(page), 'active') }, page);
	})
})));

var Paginator = module.exports = function (pathname, count, current) {
	if (!(this instanceof Paginator)) return new Paginator(pathname, count, current);
	this.pathname = String(value(pathname));
	this.url = parseUrl(this.pathname, true);
	delete this.url.search;
	location.on('change', this.updateLinks);
	this.count = new ObservableValue(count);
	this.current = new ObservableValue(count);
};

ee(Object.defineProperties(Paginator.prototype, assign({
	toDOM: d(function (document) { return (new PaginatorDom(this)).toDOM(document); })
}, autoBind({
	updateLinks: d(function () {
		if (this.pathname !== location.pathname) return;
		this.url.query = copy(location.query);
		var i, l = this.count.value;
		for (i = 1; i <= l; ++i) {
			this.url.query.page = 1;
			this.getLink(i).value = formatUrl(this.url);
		}
	})
}), memoizeMethods({
	getLink: d(function (page) {
		this.url.query.page = page;
		return new ObservableValue(formatUrl(this.url));
	})
}))));
