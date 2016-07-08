'use strict';

var assign          = require('es5-ext/object/assign')
  , copy            = require('es5-ext/object/copy')
  , value           = require('es5-ext/object/valid-value')
  , ee              = require('event-emitter')
  , d               = require('d')
  , autoBind        = require('d/auto-bind')
  , lazy            = require('d/lazy')
  , memoizeMethods  = require('memoizee/methods-plain')
  , ObservableValue = require('observable-value')
  , replaceContent  = require('dom-ext/element/#/replace-content')
  , formatUrl       = require('url3/format')
  , parseUrl        = require('url3/parse')
  , _               = require('mano').i18n
  , location        = require('mano/lib/client/location');

var PaginationDom = function (pagination) {
	this.pagination = pagination;
	this.list = ul({ class: 'pagination' });
	this.dom = _if(this.pagination.count.gt(1), this.list).toDOM(document);
	this.reload();
};
Object.defineProperties(PaginationDom.prototype, assign({
	toDOM: d(function (document) { return this.dom; })
}, autoBind({
	reload: d(function () {
		var current = this.pagination.current, count = this.pagination.count
		  , pageInput = input({ type: 'number', name: 'page', min: 1, max: count, value: current });
		this.pagination.current.on('change', function () { pageInput.value = current.value; });
		replaceContent.call(this.list, [
			// Go to beginning
			li(a({ href: _if(current.eq(1), null, this.pagination.getLink(1)) }, "<<")),
			// Go back
			li({ class: 'pagination-right-edge' },
				a({ href: _if(current.eq(1), null, current.map(function (page) {
					return this.pagination.getLink(page - 1);
				}, this)) }, "<")),
			// Page input
			li(form({ action: this.pagination.formLink, autoSubmit: true },
				div(span(_("Page ${ input } of ${ total }", {
					input: pageInput,
					total: count
				})), span({ class: 'submit' }, input({ type: 'submit' }))))),
			// Go forward
			li({ class: 'pagination-left-edge' },
				a({ href: _if(current.eq(count), null, current.map(function (page) {
					return this.pagination.getLink(page + 1);
				}, this)) }, ">")),
			// Go to end
			li(a({ href: _if(current.eq(count), null, count.map(function (page) {
				return this.pagination.getLink(page);
			}, this)) }, ">>"))
		]);
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
		delete this.url.query.page;
		this.formLink.value = formatUrl(this.url);
		var toUpdate = [1];
		if (this.current.value > 2) toUpdate.push(this.current.value - 1);
		if ((this.current.value + 1) < this.count.value) toUpdate.push(this.current.value + 1);
		if (this.current.value < this.count.value) toUpdate.push(this.count.value);
		toUpdate.forEach(function (i) {
			if (i === 1) delete this.url.query.page;
			else this.url.query.page = i;
			this.getLink(i).value = formatUrl(this.url);
		}, this);
	})
}), lazy({
	formLink: d(function () {
		delete this.url.query.page;
		return new ObservableValue(formatUrl(this.url));
	})
}), memoizeMethods({
	getLink: d(function (page) {
		if (page === 1) delete this.url.query.page;
		else this.url.query.page = page;
		return new ObservableValue(formatUrl(this.url));
	})
}))));
